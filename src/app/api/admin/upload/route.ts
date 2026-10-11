import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('API admin upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return NextResponse.json({ publicUrl: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error('API admin upload server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
