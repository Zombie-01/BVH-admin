import { NextRequest } from 'next/server';
import supabaseServer from '../../../../../../lib/supabaseServer';
import { success, error } from '../../../../../../lib/apiResponse';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatId = params.id;
    const before = req.nextUrl.searchParams.get('before');
    const limit = Number(req.nextUrl.searchParams.get('limit') || 50);

    let query: any = supabaseServer
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (before) query = query.lt('id', before);

    const { data, error: supaErr } = await query;
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to fetch messages', supaErr, 500);

    return success({ messages: (data ?? []).reverse(), has_more: (data ?? []).length === limit });
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatId = params.id;
    const payload = await req.json();
    const { sender_id, sender_role, content, message_type } = payload;
    if (!sender_id || !content)
      return error('VALIDATION_ERROR', 'Missing sender or content', null, 400);

    const { data, error: supaErr } = await supabaseServer
      .from('chat_messages')
      .insert([{ chat_id: chatId, sender_id, sender_role, content, message_type }])
      .select();
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to send message', supaErr, 500);

    // Update chats last_message and unread_count
    await supabaseServer.from('chats').update({ last_message: content }).eq('id', chatId);

    return success({ message: data && data[0] }, 201);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
