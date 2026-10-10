'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StoreService } from '@/lib/data/store-service';
import { Order } from '@/types/database.types';
import { CheckCircle2, Download, ArrowRight, Package, Mail, Sparkles, FileText } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'DES-2026-1048';
  const [order, setOrder] = useState<Order | undefined>(undefined);

  useEffect(() => {
    // Fire confetti for celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#b89053', '#121418', '#e3d2b4', '#10b981'],
      });
    } catch {
      // Ignore if canvas not supported
    }

    const found = StoreService.getOrderById(orderNumber);
    if (found) {
      setOrder(found);
    }
  }, [orderNumber]);

  return (
    <main className="py-16 bg-[#fafaf9] min-h-[75vh] flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 w-full">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-black/5 shadow-xl text-center space-y-6">
          {/* Success Badge */}
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Pago Completado con Éxito
            </span>
            <h1 className="font-heading text-3xl font-extrabold text-obsidian-950 mt-1">
              ¡Muchas Gracias por su Pedido!
            </h1>
            <p className="text-xs text-obsidian-500 mt-2">
              Número de referencia del pedido:{' '}
              <strong className="font-mono text-obsidian-950 font-bold">{orderNumber}</strong>
            </p>
          </div>

          {/* Email Notification Alert */}
          <div className="p-4 bg-brand-50/80 rounded-2xl border border-brand-200/60 text-xs text-obsidian-800 text-left flex items-start gap-3">
            <Mail className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-obsidian-950">
                Confirmación y Factura Oficial emitidas
              </p>
              <p className="text-obsidian-600 mt-0.5">
                Hemos enviado un correo transaccional mediante Resend a{' '}
                <strong>{order?.customer_email || 'su correo electrónico'}</strong> con el resumen de la compra y la factura simplificada adjunta en PDF.
              </p>
            </div>
          </div>

          {/* Order Snapshot if available */}
          {order && (
            <div className="bg-[#fafaf9] p-5 rounded-2xl border border-black/5 text-left text-xs space-y-2">
              <div className="flex justify-between font-semibold text-obsidian-950 border-b border-black/5 pb-2">
                <span>Total Facturado (con 21% IVA):</span>
                <span className="font-bold text-brand-600 text-sm">{order.total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-obsidian-600">
                <span>Destinatario:</span>
                <span>{order.customer_name}</span>
              </div>
              <div className="flex justify-between text-obsidian-600">
                <span>Método de Pago:</span>
                <span className="uppercase">{order.payment_method}</span>
              </div>
              <div className="flex justify-between text-obsidian-600">
                <span>Dirección de Envío:</span>
                <span>{order.shipping_address.street}, {order.shipping_address.city}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <a
              href={`/api/invoices/${orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-obsidian-950 text-xs font-bold tracking-wide transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              Descargar Factura PDF (Oficial)
            </a>

            <Link
              href="/mi-cuenta"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-obsidian-950 hover:bg-black text-white text-xs font-semibold tracking-wide transition-all"
            >
              <Package className="w-4 h-4" />
              Ver en Mi Cuenta
            </Link>

            <Link
              href="/productos"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-black/5 border border-black/10 text-obsidian-800 text-xs font-semibold tracking-wide transition-all"
            >
              Seguir Comprando
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="py-24 text-center">Cargando pedido...</div>}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}
