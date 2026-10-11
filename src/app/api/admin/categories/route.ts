import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await (supabase.from('categories') as any)
      .upsert(body)
      .select()
      .single();

    if (error) {
      console.error('API admin category upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('API admin category error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      console.error('API admin category delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API admin category delete error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
