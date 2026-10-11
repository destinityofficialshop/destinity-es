import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { id, delta } = await request.json();
    if (!id || delta === undefined) {
      return NextResponse.json({ error: 'Missing product id or delta' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch current product stock
    const { data: product, error: fetchError } = await (supabase.from('products') as any)
      .select('stock')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const currentStock = typeof (product as any)?.stock === 'number' ? (product as any).stock : 0;
    const newStock = Math.max(0, currentStock + Number(delta));

    const { error: updateError } = await (supabase.from('products') as any)
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ newStock });
  } catch (err: any) {
    console.error('API admin stock error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
