import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import EpaperViewer from '@/components/epaper-viewer';

export const revalidate = 60; // Cache for 60s

export const metadata: Metadata = {
  title: 'ই-পেপার | খুলনা গেজেট - Khulna Gazette E-Paper',
  description: 'খুলনা গেজেট ছাপা পত্রিকার ডিজিটাল সংস্করণ (ই-পেপার)। যেকোনো তারিখের পত্রিকা সহজে পড়ুন এবং পিডিএফ ডাউনলোড করুন।',
};

export default async function PublicEpaperList() {
  let issues: any[] = [];
  try {
    const rawIssues = await prisma.epaperIssue.findMany({
      orderBy: { date: 'desc' },
    });

    issues = rawIssues.map((issue) => ({
      id: issue.id,
      date: issue.date ? issue.date.toISOString() : new Date().toISOString(),
      pdfUrl: issue.pdfUrl || null,
      imageUrl: issue.imageUrl || null,
      imageUrls: Array.isArray(issue.imageUrls) && issue.imageUrls.length > 0
        ? issue.imageUrls
        : (issue.imageUrl ? [issue.imageUrl] : []),
      createdAt: issue.createdAt ? issue.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: issue.updatedAt ? issue.updatedAt.toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Error fetching epaper issues:', err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70">
      <PublicHeader />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <EpaperViewer initialIssues={issues} />
      </main>

      <PublicFooter />
    </div>
  );
}

