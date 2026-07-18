import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// PATCH: Update user details or reset password (Super Admin only)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, email, role, bio, avatar, password } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'সঠিক ইমেইল ঠিকানা প্রদান করুন।' }, { status: 400 });
      }

      // Check if email taken by another user
      const emailTaken = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      });
      if (emailTaken) {
        return NextResponse.json({ error: 'এই ইমেইল ইতিমধ্যে অন্য একটি অ্যাকাউন্টে ব্যবহৃত হচ্ছে।' }, { status: 400 });
      }
      updateData.email = email;
    }
    if (role) {
      // If changing own role away from SUPER_ADMIN, verify there's at least one other SUPER_ADMIN
      if (existingUser.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
        const totalAdmins = await prisma.user.count({
          where: { role: 'SUPER_ADMIN' },
        });
        if (totalAdmins <= 1) {
          return NextResponse.json(
            { error: 'সিস্টেমে কমপক্ষে একজন সুপার অ্যাডমিন থাকা আবশ্যক। আপনি নিজের রোল পরিবর্তন করতে পারবেন না।' },
            { status: 400 }
          );
        }
      }
      updateData.role = role;
    }
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'ব্যবহারকারী তথ্য আপডেট করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a user (Super Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const { id } = params;

    // Prevent self-deletion
    if (id === (session.user as any).id) {
      return NextResponse.json(
        { error: 'আপনি নিজের অ্যাকাউন্ট নিজে মুছে ফেলতে পারবেন না।' },
        { status: 400 }
      );
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' }, { status: 404 });
    }

    // If deleting a SUPER_ADMIN, ensure another exists
    if (userToDelete.role === 'SUPER_ADMIN') {
      const totalAdmins = await prisma.user.count({
        where: { role: 'SUPER_ADMIN' },
      });
      if (totalAdmins <= 1) {
        return NextResponse.json(
          { error: 'সিস্টেমে কমপক্ষে একজন সুপার অ্যাডমিন থাকা আবশ্যক। এই ব্যবহারকারীকে মুছে ফেলা যাবে না।' },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'ব্যবহারকারী মুছে ফেলার সময় সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
