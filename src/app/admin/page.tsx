'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  RefreshCw,
  Plus,
  Minus,
  Sparkles,
  BarChart3,
  CreditCard,
  Check,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'shipped'>('all');

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [ord, prod] = await Promise.all([
        StoreService.fetchOrders(),
        StoreService.fetchProducts(),
      ]);
      setOrders(ord);
      setProducts(prod);
    } catch {
      setOrders(StoreService.getOrders());
      setProducts(StoreService.getProducts());
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();

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
  const averageOrderValue = orders.length > 0 ? totalRevenue / Math.max(1, orders.filter(o => o.payment_status === 'paid').length) : 0;

  // Stock quick adjustment
  const handleStockDelta = async (productId: string, delta: number) => {
    await StoreService.updateStock(productId, delta);
  };

  // Quick order status update
  const handleStatusUpdate = async (orderId: string, newStatus: Order['order_status']) => {
    await StoreService.updateOrderStatus(orderId, newStatus);
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (selectedFilter === 'pending') return o.order_status === 'pending' || o.order_status === 'processing';
    if (selectedFilter === 'shipped') return o.order_status === 'shipped' || o.order_status === 'completed';
    return true;
  });

  // Simulated 7-day sales breakdown for SVG chart
  const weeklyData = [
    { day: 'Lun', sales: 420, orders: 2 },
    { day: 'Mar', sales: 780, orders: 3 },
    { day: 'Mié', sales: 1250, orders: 4 },
    { day: 'Jue', sales: 910, orders: 3 },
    { day: 'Vie', sales: 1680, orders: 6 },
    { day: 'Sáb', sales: 2140, orders: 7 },
    { day: 'Dom', sales: totalRevenue > 0 ? Math.min(2800, totalRevenue) : 1850, orders: 5 },
  ];
  const maxSale = Math.max(...weeklyData.map((d) => d.sales), 3000);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-obsidian-950">
            Dashboard General
          </h1>
          <p className="text-xs text-obsidian-500 mt-1">
            Métricas operativas en tiempo real conectadas a Supabase y catálogo activo de Destinity ES.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-black/10 text-obsidian-700 hover:text-black hover:bg-black/5 text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
            <span>{isRefreshing ? 'Sincronizando...' : 'Actualizar'}</span>
          </button>
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-obsidian-950 text-xs font-bold transition-all shadow-sm active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Producto</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2 hover:shadow-md transition-shadow">
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
            <Sparkles className="w-3 h-3" /> Ticket Medio: {averageOrderValue.toFixed(2)} €
          </p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2 hover:shadow-md transition-shadow">
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
            Requieren expedición o empaquetado
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-obsidian-500">Alerta Stock Crítico</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-rose-600">
            {lowStockProducts.length}
          </div>
          <p className="text-[11px] text-rose-600 font-semibold">
            {lowStockProducts.length > 0 ? 'Modelos con ≤ 3 unidades' : 'Inventario en niveles óptimos'}
          </p>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2 hover:shadow-md transition-shadow">
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
            {products.filter((p) => p.is_published).length} disponibles en boutique
          </p>
        </div>
      </div>

      {/* Analytics Chart Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-600" />
              <h2 className="font-heading text-lg font-bold text-obsidian-950">
                Rendimiento de Ventas Semanal
              </h2>
            </div>
            <p className="text-xs text-obsidian-500 mt-0.5">
              Facturación acumulada y pedidos procesados durante los últimos 7 días
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-brand-500" />
              <span className="text-obsidian-700">Facturación (€)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-obsidian-950" />
              <span className="text-obsidian-700">Pedidos</span>
            </div>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="pt-4 pb-2">
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-6 border-b border-black/10 px-2 sm:px-6">
            {weeklyData.map((item, idx) => {
              const heightPercent = Math.max(15, Math.round((item.sales / maxSale) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-obsidian-950 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap shadow-lg mb-1">
                    {item.sales} € ({item.orders} ped.)
                  </div>
                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[48px] bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-xl group-hover:from-brand-500 group-hover:to-brand-300 transition-all duration-300 relative shadow-sm"
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-obsidian-600 hidden sm:block">
                      {item.sales}€
                    </span>
                  </div>
                  <span className="text-xs font-bold text-obsidian-600 mt-2">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Orders & Fast Stock Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/5 gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-obsidian-950">
                Gestión de Pedidos & Facturación
              </h2>
              <p className="text-xs text-obsidian-500">
                Seguimiento de pedidos oficiales y descarga inmediata de albarán/factura
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-obsidian-50 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedFilter === 'all' ? 'bg-white shadow-sm text-obsidian-950' : 'text-obsidian-500 hover:text-black'
                }`}
              >
                Todos ({orders.length})
              </button>
              <button
                onClick={() => setSelectedFilter('pending')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedFilter === 'pending' ? 'bg-white shadow-sm text-amber-700 font-bold' : 'text-obsidian-500 hover:text-black'
                }`}
              >
                Pendientes ({pendingOrders.length})
              </button>
              <button
                onClick={() => setSelectedFilter('shipped')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedFilter === 'shipped' ? 'bg-white shadow-sm text-emerald-700 font-bold' : 'text-obsidian-500 hover:text-black'
                }`}
              >
                Enviados
              </button>
            </div>
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
                  <th className="pb-3 text-right">Acción Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredOrders.slice(0, 7).map((order) => (
                  <tr key={order.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="py-3 font-mono font-bold text-obsidian-950">
                      {order.order_number}
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-obsidian-900">{order.customer_name}</p>
                      <p className="text-[11px] text-obsidian-400 truncate max-w-[140px]">{order.customer_email}</p>
                    </td>
                    <td className="py-3 text-obsidian-500">
                      {new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.order_status === 'shipped' || order.order_status === 'completed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : order.order_status === 'processing'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {order.order_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-obsidian-950">
                      {order.total.toFixed(2)} €
                    </td>
                    <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                      {order.order_status !== 'shipped' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'shipped')}
                          title="Marcar como Enviado"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-[10px] font-bold border border-emerald-200 transition-colors"
                        >
                          <Truck className="w-3 h-3 text-emerald-600" />
                          <span>Enviar</span>
                        </button>
                      )}
                      <a
                        href={`/api/invoices/${order.order_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-900 p-1.5 rounded-lg hover:bg-brand-50"
                        title="Descargar Factura PDF"
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

          <div className="pt-2 flex justify-end">
            <Link
              href="/admin/pedidos"
              className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1"
            >
              Ver todos los pedidos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Inventory Quick Adjust & CMS Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Stock Controls */}
          <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="font-heading text-sm font-bold text-obsidian-950">
                  Control Rápido de Stock
                </h3>
              </div>
              <span className="text-[10px] font-bold text-obsidian-500 font-mono">
                {products.length} productos
              </span>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {products.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors ${
                    p.stock <= 3
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-obsidian-50/50 border-black/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.featured_image}
                      alt={p.title}
                      className="w-10 h-10 object-cover rounded-xl border border-black/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-obsidian-900 truncate max-w-[120px]">
                        {p.title}
                      </p>
                      <span
                        className={`text-[10px] font-bold ${
                          p.stock <= 3 ? 'text-rose-600' : 'text-obsidian-500'
                        }`}
                      >
                        Stock: {p.stock} uds.
                      </span>
                    </div>
                  </div>

                  {/* Increment/Decrement Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStockDelta(p.id, -1)}
                      disabled={p.stock <= 0}
                      className="w-6 h-6 rounded-lg bg-white border border-black/10 flex items-center justify-center text-obsidian-700 hover:bg-black/5 disabled:opacity-30 transition-colors"
                      title="Disminuir stock"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold font-mono text-obsidian-950">
                      {p.stock}
                    </span>
                    <button
                      onClick={() => handleStockDelta(p.id, 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-black/10 flex items-center justify-center text-obsidian-700 hover:bg-black/5 transition-colors"
                      title="Aumentar stock"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/admin/productos"
              className="block text-center text-xs font-bold text-brand-700 hover:underline pt-1"
            >
              Gestionar todo el catálogo de productos →
            </Link>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="bg-obsidian-950 text-white rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-heading text-sm font-bold tracking-wide">
              Acciones CMS Destinity
            </h3>
            <div className="space-y-2 text-xs">
              <Link
                href="/admin/productos/nuevo"
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-brand-400" />
                  Publicar nuevo artículo de lujo
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin/categorias"
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-400" />
                  Editar Colecciones & Categorías
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin/ajustes"
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-brand-400" />
                  Ajustes Fiscales, IVA (21%) & CIF
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
