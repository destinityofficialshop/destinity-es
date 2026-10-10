'use client';

import { useState, useEffect } from 'react';
import { StoreService } from '@/lib/data/store-service';
import { Order, OrderStatus } from '@/types/database.types';
import {
  Search,
  Download,
  Mail,
  CheckCircle2,
  Clock,
  Truck,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
  ShieldCheck,
  Send,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Email resend state
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState('');

  useEffect(() => {
    setOrders(StoreService.getOrders());
    const handleUpdate = () => {
      setOrders(StoreService.getOrders());
    };
    window.addEventListener('destinity_orders_updated', handleUpdate);
    return () => window.removeEventListener('destinity_orders_updated', handleUpdate);
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = StoreService.updateOrderStatus(orderId, newStatus);
    if (updated) {
      setOrders(StoreService.getOrders());
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    }
  };

  const handleResendInvoiceEmail = async (order: Order) => {
    setResendingEmail(true);
    setEmailStatusMsg('');

    try {
      const res = await fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatusMsg(
          data.simulated
            ? `Factura regenerada y correo transaccional simulado a ${order.customer_email}.`
            : `Factura ${data.invoiceNumber} enviada con éxito a ${order.customer_email}.`
        );
      } else {
        setEmailStatusMsg('Error al enviar correo.');
      }
    } catch (err: any) {
      setEmailStatusMsg(`Error: ${err.message}`);
    } finally {
      setResendingEmail(false);
      setTimeout(() => setEmailStatusMsg(''), 4000);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-obsidian-950">
          Gestión de Pedidos y Facturación Oficial
        </h1>
        <p className="text-xs text-obsidian-500 mt-1">
          Seguimiento logístico, facturas correlativas INV-2026 y reenvío de emails con Resend.
        </p>
      </div>

      {emailStatusMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{emailStatusMsg}</span>
        </div>
      )}

      {/* Filters and search */}
      <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-obsidian-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Nº pedido, cliente o email..."
            className="w-full bg-[#fafaf9] border border-black/10 rounded-xl pl-9 pr-3 py-2 text-xs text-obsidian-900 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#fafaf9] border border-black/10 rounded-xl px-3 py-2 text-xs text-obsidian-800 font-medium"
          >
            <option value="all">Todos los Estados</option>
            <option value="processing">En Preparación</option>
            <option value="shipped">Enviados</option>
            <option value="completed">Entregados</option>
            <option value="pending">Pendientes</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#fafaf9] border-b border-black/5 text-obsidian-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 pl-6">Nº Pedido</th>
                <th className="p-4">Cliente & NIF</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Método de Pago</th>
                <th className="p-4">Estado del Pedido</th>
                <th className="p-4">Total</th>
                <th className="p-4 pr-6 text-right">Factura & Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-obsidian-500">
                    No se encontraron pedidos con los criterios indicados.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-black/[0.015] transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-4 pl-6 font-mono font-bold text-obsidian-950">
                      {order.order_number}
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-obsidian-900">{order.customer_name}</p>
                      <p className="text-[11px] text-obsidian-400">
                        {order.customer_email} {order.shipping_address.dniNie ? `(${order.shipping_address.dniNie})` : ''}
                      </p>
                    </td>

                    <td className="p-4 text-obsidian-500">
                      {new Date(order.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="p-4">
                      <span className="uppercase text-[11px] font-semibold text-obsidian-700 bg-obsidian-100 px-2 py-0.5 rounded">
                        {order.payment_method}
                      </span>
                    </td>

                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.order_status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-[11px] font-bold rounded-lg border-0 px-2.5 py-1 cursor-pointer outline-none ${
                          order.order_status === 'shipped'
                            ? 'bg-blue-50 text-blue-700'
                            : order.order_status === 'processing'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="processing">En Preparación</option>
                        <option value="shipped">Enviado</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>

                    <td className="p-4 font-bold text-obsidian-950">
                      {order.total.toFixed(2)} €
                    </td>

                    <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {/* Download PDF */}
                        <a
                          href={`/api/invoices/${order.order_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-[11px] border border-brand-200 transition-colors"
                          title="Descargar PDF Factura Simplificada"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </a>

                        {/* Resend email */}
                        <button
                          type="button"
                          onClick={() => handleResendInvoiceEmail(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-obsidian-950 hover:bg-brand-600 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                          title="Reenviar Factura por Resend Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Reenviar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Slide-over / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col border-l border-black/10 overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 bg-[#fafaf9] border-b border-black/5 flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                  Detalle del Pedido
                </span>
                <h3 className="font-heading text-xl font-extrabold text-obsidian-950">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-obsidian-400 hover:text-black rounded-full hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 flex-1 text-xs">
              {/* Quick Actions Bar */}
              <div className="p-4 bg-brand-50 rounded-2xl border border-brand-200 flex flex-wrap items-center justify-between gap-3">
                <span className="font-bold text-brand-900">
                  Acciones Fiscales & Notificación:
                </span>
                <div className="flex gap-2">
                  <a
                    href={`/api/invoices/${selectedOrder.order_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-brand-800 border border-brand-300 font-bold hover:bg-brand-100"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar Factura PDF
                  </a>

                  <button
                    onClick={() => handleResendInvoiceEmail(selectedOrder)}
                    disabled={resendingEmail}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-950 hover:bg-brand-600 text-white font-bold cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {resendingEmail ? 'Enviando...' : 'Reenviar con Resend'}
                  </button>
                </div>
              </div>

              {/* Status and Logistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#fafaf9] border border-black/5 space-y-1">
                  <span className="text-[10px] text-obsidian-400 uppercase font-bold">Estado de Envío</span>
                  <p className="font-bold text-obsidian-900 text-sm capitalize">
                    {selectedOrder.order_status}
                  </p>
                  <p className="text-obsidian-500">Agencia asignada: SEUR 24h Express</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#fafaf9] border border-black/5 space-y-1">
                  <span className="text-[10px] text-obsidian-400 uppercase font-bold">Pago & Transacción</span>
                  <p className="font-bold text-emerald-700 text-sm uppercase">
                    {selectedOrder.payment_status} ({selectedOrder.payment_method})
                  </p>
                  <p className="text-obsidian-500">Cobro verificado</p>
                </div>
              </div>

              {/* Client & Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#fafaf9] border border-black/5 space-y-1.5">
                  <span className="text-[10px] text-obsidian-400 uppercase font-bold">Datos del Cliente</span>
                  <p className="font-bold text-obsidian-900">{selectedOrder.customer_name}</p>
                  <p className="text-obsidian-600">Email: {selectedOrder.customer_email}</p>
                  {selectedOrder.customer_phone && <p className="text-obsidian-600">Tel: {selectedOrder.customer_phone}</p>}
                  {selectedOrder.shipping_address.dniNie && (
                    <p className="font-mono text-brand-700 font-bold">NIF/CIF: {selectedOrder.shipping_address.dniNie}</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-[#fafaf9] border border-black/5 space-y-1.5">
                  <span className="text-[10px] text-obsidian-400 uppercase font-bold">Dirección de Entrega</span>
                  <p className="text-obsidian-800">{selectedOrder.shipping_address.street}</p>
                  <p className="text-obsidian-800">
                    {selectedOrder.shipping_address.postalCode} {selectedOrder.shipping_address.city} ({selectedOrder.shipping_address.province})
                  </p>
                  <p className="text-obsidian-800">{selectedOrder.shipping_address.country}</p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-3">
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-obsidian-900">
                  Artículos del Pedido
                </h4>
                <div className="divide-y divide-black/5 border border-black/5 rounded-2xl p-4 bg-[#fafaf9]">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product_image || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=80&q=80'}
                          alt={item.product_title}
                          className="w-12 h-14 object-cover rounded-lg border border-black/10"
                        />
                        <div>
                          <p className="font-bold text-obsidian-950">{item.product_title}</p>
                          <p className="text-[11px] text-obsidian-500">Cantidad: {item.quantity}</p>
                          {item.variant_selected && (
                            <p className="text-[10px] text-brand-700">
                              {Object.entries(item.variant_selected).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="font-bold text-obsidian-950">
                        {(item.price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fiscal Totals */}
              <div className="p-4 rounded-2xl bg-white border border-black/10 space-y-2">
                <div className="flex justify-between text-obsidian-600">
                  <span>Base Imponible:</span>
                  <span className="font-semibold text-obsidian-900">{(selectedOrder.subtotal / 1.21).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-obsidian-600">
                  <span>IVA Régimen General (21%):</span>
                  <span className="font-semibold text-obsidian-900">{selectedOrder.tax_amount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-obsidian-600">
                  <span>Gastos de Envío:</span>
                  <span className="font-semibold text-obsidian-900">
                    {selectedOrder.shipping_amount === 0 ? 'Gratis' : `${selectedOrder.shipping_amount.toFixed(2)} €`}
                  </span>
                </div>
                <div className="pt-2 border-t border-black/10 flex justify-between font-bold text-sm text-obsidian-950">
                  <span>Total Facturado:</span>
                  <span className="text-brand-600 font-extrabold">{selectedOrder.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
