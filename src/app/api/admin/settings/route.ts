import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await (supabase.from('store_settings') as any)
      .upsert({ ...body, id: 1 })
      .select()
      .single();

    if (error) {
      console.error('API admin settings upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('API admin settings error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
