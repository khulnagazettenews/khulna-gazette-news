import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const relativePath = params.path.join('/');
    const localPath = path.join(process.cwd(), 'public', 'uploads', relativePath);

    // 1. If file exists locally on disk in public/uploads/, serve it directly
    if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
      const fileBuffer = fs.readFileSync(localPath);
      const ext = path.extname(localPath).toLowerCase();
      
      let contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.pdf') contentType = 'application/pdf';

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 2. Fallback to remote WordPress site if file doesn't exist locally
    const remoteUrl = `https://khulnagazette.com/wp-content/uploads/${relativePath}`;
    const remoteRes = await fetch(remoteUrl, { next: { revalidate: 86400 } });
    
    if (remoteRes.ok) {
      const contentType = remoteRes.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await remoteRes.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  } catch (err) {
    console.error('Uploads proxy error:', err);
  }

  return new NextResponse('File not found', { status: 404 });
}
