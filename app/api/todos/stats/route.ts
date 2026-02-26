import { NextResponse } from 'next/server';
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

export async function GET() {
  const supabase = getSupabase();
  const today = todayStr();

  try {
    const { data: todayTasks, error: todayErr } = await supabase
      .from('todos')
      .select('id, done')
      .eq('date', today);

    if (todayErr) throw todayErr;

    const { data: overdueTasks, error: overdueErr } = await supabase
      .from('todos')
      .select('id, done')
      .lt('date', today)
      .eq('done', false);

    if (overdueErr) throw overdueErr;

    const allTasks = [...(todayTasks || []), ...(overdueTasks || [])];
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.done).length;

    return NextResponse.json({ total, completed });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
