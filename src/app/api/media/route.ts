import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const imagesSet = new Set<string>();

    // 1. Fetch images from local uploads directory
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      const files = await readdir(uploadDir);
      for (const file of files) {
        if (/\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(file)) {
          imagesSet.add(`/uploads/${file}`);
        }
      }
    } catch (e) {
      // Ignore if dir doesn't exist
    }

    // 2. Fetch images from DB News featured images
    try {
      const newsImages = await prisma.news.findMany({
        where: { featuredImage: { not: null } },
        select: { featuredImage: true },
        take: 100,
        orderBy: { createdAt: 'desc' },
      });

      for (const item of newsImages) {
        if (item.featuredImage) {
          imagesSet.add(item.featuredImage);
        }
      }
    } catch (e) {
      // Ignore
    }

    // 3. Fetch images from Epaper issues
    try {
      const epapers = await prisma.epaperIssue.findMany({
        take: 50,
        orderBy: { date: 'desc' },
      });

      for (const ep of epapers) {
        if (ep.imageUrl) imagesSet.add(ep.imageUrl);
        if (ep.imageUrls) {
          try {
            const parsed = JSON.parse(ep.imageUrls);
            if (Array.isArray(parsed)) {
              parsed.forEach((url: string) => url && imagesSet.add(url));
            }
          } catch {
            ep.imageUrls.split(',').forEach((url: string) => url && imagesSet.add(url.trim()));
          }
        }
      }
    } catch (e) {
      // Ignore
    }

    const mediaList = Array.from(imagesSet).map((url, idx) => ({
      id: `media-${idx}`,
      url,
      name: url.split('/').pop() || `Image ${idx + 1}`,
    }));

    return NextResponse.json(mediaList);
  } catch (error) {
    console.error('Fetch media list error:', error);
    return NextResponse.json({ error: 'মিডিয়া লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
