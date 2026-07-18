import { prisma } from '@/lib/prisma';
import NewsForm from '@/components/news-form';
import { notFound } from 'next/navigation';

export const revalidate = 0; // Live fetch

export default async function EditNewsPage({ params }: { params: { id: string } }) {
  const news = await prisma.news.findUnique({
    where: { id: params.id },
    include: {
      tags: true,
    },
  });

  if (!news) {
    notFound();
  }

  // Convert Date objects to strings for Client Component boundary serialization
  const serializedNews = {
    ...news,
    createdAt: news.createdAt.toISOString(),
    updatedAt: news.updatedAt.toISOString(),
    publishedAt: news.publishedAt?.toISOString() || null,
    scheduledAt: news.scheduledAt?.toISOString() || null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">সংবাদ সম্পাদনা</h2>
        <p className="text-sm text-gray-500">বিদ্যমান সংবাদ সংশোধন ও আপডেট করুন।</p>
      </div>

      <NewsForm initialData={serializedNews} newsId={params.id} />
    </div>
  );
}
