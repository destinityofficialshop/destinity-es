'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StoreService } from '@/lib/data/store-service';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Settings,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  Store,
  FileText,
  Layers,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(StoreService.getCurrentUser());

  useEffect(() => {
    setCurrentUser(StoreService.getCurrentUser());
  }, []);

  const navItems = [
    { href: '/admin', label: 'Panel Dashboard', icon: LayoutDashboard },
    { href: '/admin/productos', label: 'Gestión de Productos', icon: Package },
    { href: '/admin/productos/nuevo', label: 'Añadir Producto', icon: PlusCircle },
    { href: '/admin/categorias', label: 'Categorías & Colecciones', icon: Layers },
    { href: '/admin/pedidos', label: 'Pedidos y Facturación', icon: ShoppingBag },
    { href: '/admin/ajustes', label: 'Configuración Fiscal & Tienda', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-obsidian-950 flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-obsidian-950 text-white p-4 flex items-center justify-between border-b border-white/10">
        <Link href="/admin" className="flex items-baseline gap-1.5">
          <span className="font-heading font-extrabold text-xl tracking-wider text-white">DESTINITY</span>
          <span className="text-[10px] font-bold text-brand-400 bg-brand-950 px-1 py-0.5 rounded border border-brand-500/30">CMS</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-white/80 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-obsidian-950 text-white flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-white/10`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-extrabold text-xl tracking-wider text-white">
                DESTINITY
              </span>
              <span className="text-[10px] font-bold text-brand-400 bg-brand-950 px-1.5 py-0.5 rounded border border-brand-500/30">
                CMS
              </span>
            </div>
            <p className="text-[11px] text-obsidian-400 mt-1 font-mono">
              Back-Office v2.4 (Supabase)
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-obsidian-500 px-3 py-2">
            Gestión de Tienda
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-500 text-obsidian-950 shadow-md font-bold'
                    : 'text-obsidian-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-obsidian-950' : 'text-brand-400'}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Storefront Link & Admin Profile */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-obsidian-900/50">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-brand-400" />
            <span>Ver Tienda Pública</span>
            <ExternalLink className="w-3 h-3 text-white/50" />
          </Link>

          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/40 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <p className="font-semibold text-white truncate">{currentUser.full_name}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Supabase Conectado
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-black/10 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-lg font-bold text-obsidian-950">
              Panel de Administración
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-obsidian-500 font-mono bg-black/5 px-3 py-1.5 rounded-lg">
              <span>{new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>

            <Link
              href="/admin/productos/nuevo"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-obsidian-950 text-xs font-bold transition-colors shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nuevo Producto</span>
            </Link>
          </div>
        </header>

        <main className="p-6 sm:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
