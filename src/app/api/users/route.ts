import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// GET: Fetch all users (Super Admin and Admin allowed)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserRole = (session?.user as any)?.role;
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(currentUserRole)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const where: any = {};
    if (currentUserRole === 'ADMIN') {
      where.role = { not: 'SUPER_ADMIN' };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: 'ব্যবহারকারী তালিকা লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

// POST: Create a new user (Super Admin and Admin allowed)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserRole = (session?.user as any)?.role;
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(currentUserRole)) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role, bio, avatar } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'নাম, ইমেইল, পাসওয়ার্ড এবং রোল প্রদান করা আবশ্যক।' },
        { status: 400 }
      );
    }

    // Role safety validation
    if (currentUserRole === 'ADMIN' && role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'আপনি সুপার অ্যাডমিন রোল তৈরি করতে পারবেন না।' },
        { status: 403 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'সঠিক ইমেইল ঠিকানা প্রদান করুন।' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'এই ইমেইল ঠিকানা দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে।' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        bio: bio || null,
        avatar: avatar || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'নতুন ব্যবহারকারী তৈরি করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
