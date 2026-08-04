import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      position,
      fullName,
      dob,
      mobile,
      email,
      facebookLink,
      presentAddress,
      permanentAddress,
      educations,
      currentJobs,
      experiences,
      workLinks,
      photoUrl,
      nidUrl,
      notes,
    } = body;

    if (!position || !fullName || !mobile || !email) {
      return NextResponse.json(
        { error: 'আবশ্যক ফিল্ডগুলো পূরণ করুন (পদ, নাম, মোবাইল, ইমেইল)' },
        { status: 400 }
      );
    }

    const db = (prisma as any).jobApplication || prisma.jobApplication;
    const application = await db.create({
      data: {
        position,
        fullName,
        dob: dob || '',
        mobile,
        email,
        facebookLink: facebookLink || '',
        presentAddress: typeof presentAddress === 'object' ? JSON.stringify(presentAddress) : (presentAddress || ''),
        permanentAddress: typeof permanentAddress === 'object' ? JSON.stringify(permanentAddress) : (permanentAddress || ''),
        educations: typeof educations === 'object' ? JSON.stringify(educations) : (educations || ''),
        currentJobs: typeof currentJobs === 'object' ? JSON.stringify(currentJobs) : (currentJobs || ''),
        experiences: typeof experiences === 'object' ? JSON.stringify(experiences) : (experiences || ''),
        workLinks: typeof workLinks === 'object' ? JSON.stringify(workLinks) : (workLinks || ''),
        photoUrl: photoUrl || '',
        nidUrl: nidUrl || '',
        notes: notes || '',
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error: any) {
    console.error('Job application submission error:', error);
    return NextResponse.json(
      { error: error.message || 'আবেদন জমা নিতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = (prisma as any).jobApplication || prisma.jobApplication;
    const applications = await db.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(applications);
  } catch (error: any) {
    console.error('Fetch job applications error:', error);
    return NextResponse.json(
      { error: error.message || 'আবেদনসমূহ লোড করা যায়নি' },
      { status: 500 }
    );
  }
}
