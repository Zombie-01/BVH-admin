import { serve } from 'https://deno.land/std@0.203.0/http/server.ts';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.26.0/+esm';

const NEXT_PUBLIC_SUPABASE_URL = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL')!;
const SUPABASE_KEY = Deno.env.get('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

serve(async (req) => {
  const url = new URL(req.url);
  try {
    if (req.method === 'GET') {
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search');
      const page = Number(url.searchParams.get('page') || 1);
      const limit = Number(url.searchParams.get('limit') || 20);

      let query: any = supabase.from('stores').select('*');
      if (category) query = query.eq('category', category);
      if (search) query = query.ilike('name', `%${search}%`);

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error } = await query.range(from, to).order('created_at', { ascending: false });
      if (error)
        return new Response(JSON.stringify({ error: String(error) }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        });

      return new Response(JSON.stringify({ stores: data ?? [], page, limit }), {
        headers: { 'content-type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { name, description, owner_id, category, location, phone } = body;
      if (!name || !owner_id)
        return new Response(JSON.stringify({ error: 'Missing fields' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        });

      const { data, error } = await supabase
        .from('stores')
        .insert([{ name, description, owner_id, category, location, phone }])
        .select();
      if (error)
        return new Response(JSON.stringify({ error: String(error) }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        });

      return new Response(JSON.stringify({ store: data && data[0] }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});
