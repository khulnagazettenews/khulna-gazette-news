import { Suspense } from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PublicHeader from '@/components/public-header';
import BreakingNewsTicker from '@/components/breaking-news';
import PublicFooter from '@/components/public-footer';
import EpaperViewer from '@/components/epaper-viewer';
import SidebarWidgets from '@/components/sidebar-widgets';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60s

export const metadata: Metadata = {
  title: 'ই-পেপার | খুলনা গেজেট - Khulna Gazette E-Paper',
  description: 'খুলনা গেজেট ছাপা পত্রিকার ডিজিটাল সংস্করণ (ই-পেপার)। যেকোনো তারিখের পত্রিকা সহজে পড়ুন এবং পিডিএফ ডাউনলোড করুন।',
};

const serializeList = (list: any[]) => {
  return list.map((item) => ({
    ...item,
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
    createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: item.updatedAt ? item.updatedAt.toISOString() : new Date().toISOString(),
  }));
};

export default async function PublicEpaperList({
  searchParams,
}: {
  searchParams?: { date?: string };
}) {
  let issues: any[] = [];
  let latestNews: any[] = [];
  let popularNews: any[] = [];
  let exclusiveNews: any[] = [];
  let sidebarAds: any[] = [];
  const selectedDate = searchParams?.date || undefined;

  const listSelect = {
    id: true,
    title: true,
    featuredImage: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
    viewCount: true,
    reporterName: true,
    authorTitle: true,
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
  };

  try {
    const [rawIssues, fetchedLatest, fetchedPopular, fetchedExclusive, fetchedAds] = await Promise.all([
      prisma.epaperIssue.findMany({
        where: { imageUrl: { not: null } },
        orderBy: { date: 'desc' },
      }),
      prisma.news.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        take: 10,
        select: listSelect,
      }),
      prisma.news.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: listSelect,
      }),
      prisma.news.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { category: { slug: { in: ['gazette-exclusive', 'exclusive', 'gazetteexclusive'] } } },
            { category: { name: { contains: 'গেজেট এক্সক্লুসিভ' } } },
            { subCategory: { slug: { in: ['gazette-exclusive', 'exclusive', 'gazetteexclusive'] } } },
            { subCategory: { name: { contains: 'গেজেট এক্সক্লুসিভ' } } },
          ],
        },
        orderBy: { publishedAt: 'desc' },
        take: 5,
        select: listSelect,
      }),
      prisma.advertisement.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    latestNews = fetchedLatest;
    popularNews = fetchedPopular;
    exclusiveNews = fetchedExclusive;
    sidebarAds = fetchedAds;

    issues = rawIssues.map((issue) => ({
      id: issue.id,
      date: issue.date ? issue.date.toISOString() : new Date().toISOString(),
      pdfUrl: issue.pdfUrl || null,
      imageUrl: issue.imageUrl || null,
      imageUrls: (() => {
        if (typeof issue.imageUrls === 'string' && issue.imageUrls.trim()) {
          try {
            const parsed = JSON.parse(issue.imageUrls);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch {
            const split = issue.imageUrls.split(',').map((s) => s.trim()).filter(Boolean);
            if (split.length > 0) return split;
          }
        }
        if (Array.isArray(issue.imageUrls) && issue.imageUrls.length > 0) return issue.imageUrls;
        return issue.imageUrl ? [issue.imageUrl] : [];
      })(),
      createdAt: issue.createdAt ? issue.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: issue.updatedAt ? issue.updatedAt.toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Error fetching epaper page data:', err);
  }

  const availableDates = issues.map((i) => i.date.split('T')[0]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70">
      <PublicHeader />
      <BreakingNewsTicker />

      <main className="flex-grow w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Epaper Viewer Section (9 Columns - Same as Homepage Left Layout) */}
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-white rounded-xl p-3 sm:p-5 border border-slate-200/80 shadow-xs">
              <Suspense fallback={<div className="p-8 text-center font-bold text-slate-500">ই-পেপার লোড হচ্ছে...</div>}>
                <EpaperViewer initialIssues={issues} initialSelectedDate={selectedDate} />
              </Suspense>
            </div>
          </div>

          {/* Sidebar Section (3 Columns - Same as Homepage Sidebar Layout) */}
          <div className="lg:col-span-3">
            <Suspense fallback={<div className="p-4 text-center text-slate-400">সাইডবার লোড হচ্ছে...</div>}>
              <SidebarWidgets
                latestNews={serializeList(latestNews)}
                popularNews={serializeList(popularNews)}
                exclusiveNews={serializeList(exclusiveNews)}
                sidebarAds={serializeList(sidebarAds)}
                isEpaperPage={true}
                availableDates={availableDates}
              />
            </Suspense>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
