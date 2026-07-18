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
      return NextResponse.json({ error: 'কোনো ফাইল পাওয়া যায়নি' }, { status: 450 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename to URL-friendly string
    const filename = `${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.]/g, '_')}`;

    // 1. If ImageKit is configured, upload to ImageKit.io
    if (isImageKitConfigured && imagekit) {
      try {
        const fileObj = await toFile(buffer, filename);
        const uploadResult = await imagekit.files.upload({
          file: fileObj,
          fileName: filename,
          folder: '/khulna-gazette',
        });

        return NextResponse.json({ url: uploadResult.url });
      } catch (err) {
        console.error('ImageKit upload error, falling back to local:', err);
      }
    }

    // 2. Fallback to Local Storage in public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure the uploads directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('File upload general exception:', error);
    return NextResponse.json({ error: 'ফাইল আপলোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
