import { NextRequest } from 'next/server';
import supabaseServer from '../../../../../lib/supabaseServer';
import { success, error } from '../../../../../lib/apiResponse';

export async function DELETE(req: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    const fileId = params.fileId;
    // Expect query params: bucket and path
    const bucket = req.nextUrl.searchParams.get('bucket');
    const path = req.nextUrl.searchParams.get('path');
    if (!bucket || !path)
      return error('VALIDATION_ERROR', 'bucket and path query params required', null, 400);

    const { error: delErr } = await supabaseServer.storage.from(bucket).remove([path]);
    if (delErr) return error('INTERNAL_ERROR', 'Failed to delete file', delErr, 500);

    return success({ deleted: true }, 200);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
