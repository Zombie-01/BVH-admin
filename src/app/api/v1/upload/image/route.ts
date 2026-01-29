import { NextRequest } from 'next/server';
import supabaseServer from '../../../../../lib/supabaseServer';
import { error, success } from '../../../../../lib/apiResponse';

export async function POST(req: NextRequest) {
  try {
    // Expect multipart/form-data with `file` and optional `folder` and `bucket` fields
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const folder = (form.get('folder') as string) || '';
    const bucket = (form.get('bucket') as string) || 'product-images';

    if (!file) return error('VALIDATION_ERROR', 'Missing file field', null, 400);

    // Construct a safe path
    const filename = `${Date.now()}_${(file as any).name || 'upload'}`;
    const path = folder ? `${folder.replace(/^\/+|\/+$/g, '')}/${filename}` : filename;

    // `file` from formData exposes stream() in Node — pass to Supabase storage
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error: upErr } = await supabaseServer.storage
      .from(bucket)
      .upload(path, buffer, { upsert: false });
    if (upErr) return error('INTERNAL_ERROR', 'Upload failed', upErr, 500);

    // Get public URL
    const { data: urlData } = supabaseServer.storage.from(bucket).getPublicUrl(path);

    return success({ url: urlData.publicUrl, bucket, path }, 201);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
