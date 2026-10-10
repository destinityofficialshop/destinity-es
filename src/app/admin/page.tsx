'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StoreService } from '@/lib/data/store-service';
import { Order, Product } from '@/types/database.types';
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Package,
  ArrowRight,
  Download,
  CheckCircle2,
  Clock,
  Truck,
  PlusCircle,
  Settings,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setOrders(StoreService.getOrders());
    setProducts(StoreService.getProducts());

    const handleUpdate = () => {
      setOrders(StoreService.getOrders());
      setProducts(StoreService.getProducts());
    };
    window.addEventListener('destinity_orders_updated', handleUpdate);
    window.addEventListener('destinity_products_updated', handleUpdate);
    return () => {
      window.removeEventListener('destinity_orders_updated', handleUpdate);
      window.removeEventListener('destinity_products_updated', handleUpdate);
    };
  }, []);

  // Compute metrics
  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.order_status === 'pending' || o.order_status === 'processing');
  const lowStockProducts = products.filter((p) => p.stock <= 3);
  const totalProducts = products.length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-obsidian-950">
          Dashboard General
        </h1>
        <p className="text-xs text-obsidian-500 mt-1">
          Métricas en tiempo real sincronizadas con Supabase y estado de la tienda Destinity ES.
        </p>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-obsidian-500">Ventas Totales</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-obsidian-950">
            {totalRevenue.toFixed(2)} €
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            +18.4% vs mes anterior
          </p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-obsidian-500">Pedidos Pendientes</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-obsidian-950">
            {pendingOrders.length}
          </div>
          <p className="text-[11px] text-amber-700">
            Requieren preparación en taller
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-obsidian-500">Alerta Stock Bajo</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-rose-600">
            {lowStockProducts.length}
          </div>
          <p className="text-[11px] text-rose-600 font-semibold">
            {lowStockProducts.length > 0 ? 'Artículos con ≤ 3 unidades' : 'Inventario en niveles óptimos'}
          </p>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-obsidian-500">Catálogo Activo</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-obsidian-950">
            {totalProducts}
          </div>
          <p className="text-[11px] text-obsidian-500">
            {products.filter((p) => p.is_published).length} publicados en escaparate
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div>
              <h2 className="font-heading text-lg font-bold text-obsidian-950">
                Últimos Pedidos y Facturas
              </h2>
              <p className="text-xs text-obsidian-500">
                Pedidos emitidos recientemente y estado de cobro
              </p>
            </div>
            <Link
              href="/admin/pedidos"
              className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 text-obsidian-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Nº Pedido</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 text-right">Importe</th>
                  <th className="pb-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-black/[0.02]">
                    <td className="py-3 font-mono font-bold text-obsidian-950">
                      {order.order_number}
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-obsidian-900">{order.customer_name}</p>
                      <p className="text-[11px] text-obsidian-400">{order.customer_email}</p>
                    </td>
                    <td className="py-3 text-obsidian-500">
                      {new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.order_status === 'shipped'
                            ? 'bg-blue-50 text-blue-700'
                            : order.order_status === 'processing'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {order.order_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-obsidian-950">
                      {order.total.toFixed(2)} €
                    </td>
                    <td className="py-3 text-right">
                      <a
                        href={`/api/invoices/${order.order_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-900 p-1 rounded hover:bg-brand-50"
                        title="Descargar Factura Oficial"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Low Stock & CMS Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="font-heading text-sm font-bold text-obsidian-950">
                Inventario Crítico (Stock ≤ 3)
              </h3>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-obsidian-500 text-center py-4">
                No hay productos con stock bajo en este momento.
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-rose-50/60 border border-rose-100">
                    <img
                      src={p.featured_image}
                      alt={p.title}
                      className="w-10 h-12 object-cover rounded-lg border border-black/10"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <h4 className="font-semibold text-obsidian-900 truncate">{p.title}</h4>
                      <p className="text-rose-700 font-bold text-[11px]">
                        ¡Solo quedan {p.stock} unidades!
                      </p>
                    </div>
                    <Link
                      href={`/admin/productos/${p.id}`}
                      className="px-2 py-1 bg-white hover:bg-rose-100 text-rose-800 text-[10px] font-bold rounded border border-rose-200 transition-colors"
                    >
                      Editar
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="bg-obsidian-950 text-white rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-heading text-sm font-bold tracking-wide">
              Acciones Rápidas CMS
            </h3>
            <div className="space-y-2 text-xs">
              <Link
                href="/admin/productos/nuevo"
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-brand-400" />
                  Publicar nuevo artículo
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin/pedidos"
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-brand-400" />
                  Gestionar envíos pendientes
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin/ajustes"
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-brand-400" />
                  Ajustes fiscales y CIF/NIF
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
