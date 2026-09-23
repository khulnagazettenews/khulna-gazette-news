import { NextResponse } from 'next/server';
import ImageKit, { toFile } from '@imagekit/nodejs';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Configure ImageKit if private key exists
const isImageKitConfigured = !!process.env.IMAGEKIT_PRIVATE_KEY;

let imagekit: ImageKit | null = null;

if (isImageKitConfigured) {
  imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'কোনো ফাইল পাওয়া যায়নি' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename to URL-friendly string preserving extension
    const ext = path.extname(file.name) || '.jpg';
    const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${Date.now()}-${cleanName || 'upload'}${ext.toLowerCase()}`;

    // 1. If ImageKit is configured, upload to ImageKit.io
    if (isImageKitConfigured && imagekit) {
      try {
        const fileObj = await toFile(buffer, filename);
        const uploadResult = await imagekit.files.upload({
          file: fileObj,
          fileName: filename,
          folder: '/khulna-gazette',
        });

        if (uploadResult && uploadResult.url) {
          return NextResponse.json({ url: uploadResult.url });
        }
      } catch (err) {
        console.error('ImageKit upload error, falling back to local/data-url:', err);
      }
    }

    // 2. Fallback to Local Storage in public/uploads
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (localErr) {
      console.error('Local file write error, falling back to Base64 Data URL:', localErr);
      
      // 3. Fallback to Data URL if local file system is read-only (e.g. Vercel) or fails
      const mimeType = file.type || 'image/jpeg';
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      return NextResponse.json({ url: dataUrl });
    }
  } catch (error) {
    console.error('File upload general exception:', error);
    return NextResponse.json({ error: 'ফাইল আপলোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

