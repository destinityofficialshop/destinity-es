'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StoreService } from '@/lib/data/store-service';
import { Order, Profile, Address } from '@/types/database.types';
import {
  Package,
  MapPin,
  User,
  Download,
  ExternalLink,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  Truck,
  Shield,
  FileText,
} from 'lucide-react';

export default function CustomerAccountPage() {
  const [currentUser, setCurrentUser] = useState<Profile>(StoreService.getCurrentUser());
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  // Address edit state
  const [addresses, setAddresses] = useState<Address[]>([
    {
      fullName: 'Carlos Mendoza Ruiz',
      street: 'Calle Serrano 45, 3º Dcha',
      city: 'Madrid',
      province: 'Madrid',
      postalCode: '28001',
      country: 'España',
      phone: '+34 612 345 678',
      dniNie: '48921455X',
    },
  ]);

  const [newAddress, setNewAddress] = useState<Address>({
    fullName: '',
    street: '',
    city: '',
    province: 'Madrid',
    postalCode: '',
    country: 'España',
    phone: '',
    dniNie: '',
  });
  const [showAddAddress, setShowAddAddress] = useState(false);

  useEffect(() => {
    setCurrentUser(StoreService.getCurrentUser());
    setOrders(StoreService.getOrders());

    const handleUpdate = () => {
      setOrders(StoreService.getOrders());
    };
    window.addEventListener('destinity_orders_updated', handleUpdate);
    return () => window.removeEventListener('destinity_orders_updated', handleUpdate);
  }, []);

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddress.street && newAddress.city) {
      setAddresses([...addresses, newAddress]);
      setShowAddAddress(false);
      setNewAddress({
        fullName: '',
        street: '',
        city: '',
        province: 'Madrid',
        postalCode: '',
        country: 'España',
        phone: '',
        dniNie: '',
      });
    }
  };

  const handleDeleteAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const getStatusBadge = (status: Order['order_status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Entregado
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            <Truck className="w-3 h-3" /> Enviado (SEUR)
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3" /> En Preparación
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-obsidian-600 bg-obsidian-100 px-2.5 py-0.5 rounded-full">
            Pendiente
          </span>
        );
    }
  };

  return (
    <>
      <Header />
      <main className="py-12 bg-[#fafaf9] min-h-[80vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top user header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                alt={currentUser.full_name || 'Usuario'}
                className="w-16 h-16 rounded-2xl object-cover border border-black/10"
              />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                  Área de Cliente
                </span>
                <h1 className="font-heading text-2xl font-extrabold text-obsidian-950">
                  {currentUser.full_name || 'Mi Perfil'}
                </h1>
                <p className="text-xs text-obsidian-500">
                  {currentUser.email} &bull; Rol en plataforma: <strong>{currentUser.role}</strong>
                </p>
              </div>
            </div>

            {currentUser.role === 'admin' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-obsidian-950 hover:bg-brand-600 text-white text-xs font-semibold tracking-wide transition-colors"
              >
                Acceder al Panel Back-Office
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-black/10 mb-8 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-brand-500 text-brand-700 bg-white/50 rounded-t-xl'
                  : 'border-transparent text-obsidian-600 hover:text-black'
              }`}
            >
              <Package className="w-4 h-4" />
              Historial de Pedidos ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] whitespace-nowrap ${
                activeTab === 'addresses'
                  ? 'border-brand-500 text-brand-700 bg-white/50 rounded-t-xl'
                  : 'border-transparent text-obsidian-600 hover:text-black'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Libreta de Direcciones ({addresses.length})
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-brand-500 text-brand-700 bg-white/50 rounded-t-xl'
                  : 'border-transparent text-obsidian-600 hover:text-black'
              }`}
            >
              <User className="w-4 h-4" />
              Detalles de la Cuenta & Seguridad
            </button>
          </div>

          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-black/5">
                  <Package className="w-10 h-10 text-obsidian-300 mx-auto mb-3" />
                  <h3 className="font-heading text-lg font-bold text-obsidian-950">
                    Aún no tienes pedidos registrados
                  </h3>
                  <p className="text-xs text-obsidian-500 mt-1 mb-6">
                    Tus compras y facturas en PDF aparecerán aquí en cuanto realices un pedido.
                  </p>
                  <Link
                    href="/productos"
                    className="px-6 py-2.5 rounded-xl bg-obsidian-950 text-white text-xs font-semibold"
                  >
                    Explorar Catálogo
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-6"
                  >
                    {/* Top bar of order card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/5 gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-heading text-base font-extrabold text-obsidian-950 font-mono">
                          #{order.order_number}
                        </span>
                        <span className="text-xs text-obsidian-400">
                          {new Date(order.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        {getStatusBadge(order.order_status)}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Download invoice button */}
                        <a
                          href={`/api/invoices/${order.order_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-semibold transition-colors"
                          title="Descargar factura oficial con IVA desglosado"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar Factura PDF
                        </a>
                      </div>
                    </div>

                    {/* Items row */}
                    <div className="divide-y divide-black/5">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.product_image || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80'}
                              alt={item.product_title}
                              className="w-12 h-14 object-cover rounded-lg border border-black/10"
                            />
                            <div>
                              <h4 className="font-semibold text-obsidian-900">{item.product_title}</h4>
                              <p className="text-obsidian-500">Cantidad: {item.quantity}</p>
                              {item.variant_selected && (
                                <p className="text-[11px] text-brand-700">
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

                    {/* Footer with totals */}
                    <div className="pt-4 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fafaf9] -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 rounded-b-3xl">
                      <div className="text-xs text-obsidian-500 space-y-0.5">
                        <p>
                          <strong>Envío a:</strong> {order.shipping_address.street}, {order.shipping_address.city} ({order.shipping_address.postalCode})
                        </p>
                        <p>
                          <strong>Método:</strong> {order.payment_method.toUpperCase()} &bull; <strong>Estado pago:</strong> {order.payment_status}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-obsidian-500 block">Total con 21% IVA</span>
                        <span className="font-heading text-xl font-extrabold text-obsidian-950">
                          {order.total.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-lg font-bold text-obsidian-950">
                  Direcciones Guardadas de Envío y Facturación
                </h3>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-obsidian-950 hover:bg-brand-600 text-white text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir Nueva Dirección
                </button>
              </div>

              {/* Add form */}
              {showAddAddress && (
                <form
                  onSubmit={handleAddAddress}
                  className="bg-white p-6 rounded-3xl border border-black/10 shadow-sm space-y-4"
                >
                  <h4 className="font-heading text-sm font-bold text-obsidian-950">
                    Nueva Dirección
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-obsidian-600 mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900"
                      />
                    </div>
                    <div>
                      <label className="block text-obsidian-600 mb-1">NIF / DNI (Para Facturas) *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.dniNie}
                        onChange={(e) => setNewAddress({ ...newAddress, dniNie: e.target.value })}
                        className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-obsidian-600 mb-1">Dirección Completa *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900"
                      />
                    </div>
                    <div>
                      <label className="block text-obsidian-600 mb-1">Ciudad *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900"
                      />
                    </div>
                    <div>
                      <label className="block text-obsidian-600 mb-1">Código Postal *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-4 py-2 rounded-xl text-xs text-obsidian-600 hover:bg-black/5"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-obsidian-950 font-bold text-xs"
                    >
                      Guardar Dirección
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                        {idx === 0 ? 'Dirección Principal' : `Dirección #${idx + 1}`}
                      </span>
                      <button
                        onClick={() => handleDeleteAddress(idx)}
                        className="text-obsidian-300 hover:text-rose-600 p-1 transition-colors"
                        title="Eliminar dirección"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-heading text-sm font-bold text-obsidian-950">{addr.fullName}</h4>
                    <div className="text-xs text-obsidian-600 space-y-1">
                      <p>{addr.street}</p>
                      <p>{addr.postalCode} {addr.city} ({addr.province})</p>
                      <p>{addr.country}</p>
                      {addr.dniNie && <p className="font-mono text-[11px]">NIF: {addr.dniNie}</p>}
                      {addr.phone && <p>Tel: {addr.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm max-w-xl space-y-6">
              <h3 className="font-heading text-lg font-bold text-obsidian-950">
                Información de Acceso y Datos Fiscales
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-obsidian-600 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    defaultValue={currentUser.full_name || ''}
                    className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-3 text-obsidian-900"
                  />
                </div>

                <div>
                  <label className="block text-obsidian-600 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full bg-black/5 border border-black/10 rounded-xl p-3 text-obsidian-500 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-obsidian-400 mt-1">
                    Gestionado de forma segura mediante Supabase Auth.
                  </p>
                </div>

                <div>
                  <label className="block text-obsidian-600 mb-1">Rol de Permisos en Destinity ES</label>
                  <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-brand-900 font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-brand-600" />
                    <span>Rol actual: {currentUser.role.toUpperCase()}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    className="px-6 py-2.5 rounded-xl bg-obsidian-950 hover:bg-brand-600 text-white font-semibold text-xs transition-colors"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
