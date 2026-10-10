'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { StoreService } from '@/lib/data/store-service';
import { ProductForm } from '@/components/admin/ProductForm';
import { Product } from '@/types/database.types';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = StoreService.getProductById(id);
    setProduct(found);
    setLoading(false);
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-xs text-obsidian-500">Cargando producto...</div>;
  }

  if (!product) {
    return (
      <div className="p-12 text-center text-xs text-obsidian-500">
        Producto no encontrado.
      </div>
    );
  }

  return <ProductForm initialProduct={product} />;
}
