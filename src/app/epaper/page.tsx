import { prisma } from '@/lib/prisma';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import EpaperViewer from '@/components/epaper-viewer';

export const revalidate = 60; // Cache for 60s

export default async function PublicEpaperList() {
  const issues = await prisma.epaperIssue.findMany({
    orderBy: { date: 'desc' },
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EpaperViewer initialIssues={issues} />
      </main>

      <PublicFooter />
    </div>
  );
}
