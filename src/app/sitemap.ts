import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  // 1. Static Pages
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/epaper',
    '/photo-gallery',
    '/video-gallery',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Categories
  const categories = await prisma.category.findMany({
    include: {
      parent: true
    }
  });
  
  const categoryRoutes = categories.map((cat) => {
    // If it's a subcategory, URL is parent/sub
    const urlPath = cat.parentId && cat.parent 
      ? `/${cat.parent.slug}/${cat.slug}`
      : `/${cat.slug}`;
      
    return {
      url: `${baseUrl}${urlPath}`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    };
  });

  // 3. Articles (Latest 100 published)
  const articles = await prisma.news.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 100,
    include: { category: true },
  });

  const articleRoutes = articles.map((art) => ({
    url: `${baseUrl}/${art.category?.slug || 'news'}/${art.slug}-${art.id}`,
    lastModified: new Date(art.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
