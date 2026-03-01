import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter');
  const date = searchParams.get('date');
  const month = searchParams.get('month');
  const includeOverdue = searchParams.get('include_overdue') === 'true';

  try {
    let query = supabase.from('todos').select('*');

    if (filter === 'today') {
      const today = searchParams.get('client_today') || todayStr();
      if (includeOverdue) {
        query = query
          .eq('done', false)
          .or(`date.eq.${today},date.lt.${today}`)
          .not('date', 'is', null);
      } else {
        query = query.eq('date', today);
      }
    } else if (filter === 'inbox') {
      query = query.is('date', null).eq('done', false);
    } else if (date) {
      query = query.eq('date', date);
    } else if (month) {
      const startDate = `${month}-01`;
      const [y, m] = month.split('-').map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { text, date, priority } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'テキストは必須です' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('todos')
      .insert({
        text: text.trim(),
        date: date || null,
        priority: priority || 'none',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
