import { NextResponse } from 'next/server';
import { readdir, stat, unlink } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(date: Date) {
  return date.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const itemsMap = new Map<string, {
      id: string;
      url: string;
      name: string;
      date?: string;
      size?: string;
      dimensions?: string;
      type?: string;
    }>();

    // 1. Fetch images from local uploads directory with file stats
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      const files = await readdir(uploadDir);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (/\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(file)) {
          const filePath = path.join(uploadDir, file);
          const fileStat = await stat(filePath).catch(() => null);
          const fileUrl = `/uploads/${file}`;
          
          const ext = file.split('.').pop()?.toUpperCase() || 'PNG';
          itemsMap.set(fileUrl, {
            id: `upload-${file}`,
            url: fileUrl,
            name: file,
            date: fileStat ? formatDate(fileStat.mtime) : 'সম্প্রতি',
            size: fileStat ? formatBytes(fileStat.size) : 'অজ্ঞাত',
            dimensions: '1280 by 720 pixels',
            type: `image/${ext.toLowerCase()}`,
          });
        }
      }
    } catch (e) {
      // Ignore if dir doesn't exist
    }

    // 2. Fetch images from DB News featured images
    try {
      const newsImages = await prisma.news.findMany({
        where: { featuredImage: { not: null } },
        select: { featuredImage: true, createdAt: true },
        take: 100,
        orderBy: { createdAt: 'desc' },
      });

      for (const item of newsImages) {
        if (item.featuredImage && !itemsMap.has(item.featuredImage)) {
          const url = item.featuredImage;
          const fileName = url.split('/').pop()?.split('?')[0] || 'Image';
          itemsMap.set(url, {
            id: `news-${url}`,
            url,
            name: fileName,
            date: formatDate(item.createdAt),
            size: '১৮৫ KB',
            dimensions: '1200 by 675 pixels',
            type: 'image/jpeg',
          });
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
        const addUrl = (url: string) => {
          if (url && !itemsMap.has(url)) {
            const fileName = url.split('/').pop()?.split('?')[0] || 'Epaper';
            itemsMap.set(url, {
              id: `epaper-${url}`,
              url,
              name: fileName,
              date: formatDate(ep.date),
              size: '৪৫০ KB',
              dimensions: '1600 by 2200 pixels',
              type: 'image/png',
            });
          }
        };

        if (ep.imageUrl) addUrl(ep.imageUrl);
        if (ep.imageUrls) {
          try {
            const parsed = JSON.parse(ep.imageUrls);
            if (Array.isArray(parsed)) {
              parsed.forEach((url: string) => addUrl(url));
            }
          } catch {
            ep.imageUrls.split(',').forEach((url: string) => addUrl(url.trim()));
          }
        }
      }
    } catch (e) {
      // Ignore
    }

    const mediaList = Array.from(itemsMap.values());
    return NextResponse.json(mediaList);
  } catch (error) {
    console.error('Fetch media list error:', error);
    return NextResponse.json({ error: 'মিডিয়া লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'ইউআরএল প্রদান করুন' }, { status: 400 });
    }

    // 1. Delete local file if stored in /uploads/
    if (url.startsWith('/uploads/')) {
      const filename = path.basename(url);
      const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
      await unlink(filePath).catch(() => null);
    }

    // 2. Clear matching featuredImage references in news DB
    try {
      await prisma.news.updateMany({
        where: { featuredImage: url },
        data: { featuredImage: null },
      });
    } catch (e) {
      // Ignore
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'ফাইল মুছতে ব্যর্থ হয়েছে' }, { status: 500 });
  }
}

