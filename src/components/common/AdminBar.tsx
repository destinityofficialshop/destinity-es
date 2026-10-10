'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StoreService } from '@/lib/data/store-service';
import { DEMO_ADMIN_USER, DEMO_CUSTOMER_USER } from '@/lib/data/mock-data';
import { ShieldCheck, UserCheck, Settings, ArrowUpRight, Store } from 'lucide-react';

export function AdminBar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(StoreService.getCurrentUser());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleUserChange = () => {
      setCurrentUser(StoreService.getCurrentUser());
    };
    window.addEventListener('destinity_user_changed', handleUserChange);
    return () => window.removeEventListener('destinity_user_changed', handleUserChange);
  }, []);

  if (!mounted) return null;

  const isAdmin = currentUser.role === 'admin';
  const isAdminRoute = pathname.startsWith('/admin');

  const toggleRole = () => {
    if (isAdmin) {
      StoreService.setCurrentUser(DEMO_CUSTOMER_USER);
    } else {
      StoreService.setCurrentUser(DEMO_ADMIN_USER);
    }
  };

  return (
    <aside aria-label="Barra de gestión Destinity ES" className="bg-obsidian-950 text-white text-xs border-b border-white/10 px-4 py-2 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 font-semibold text-brand-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Destinity CMS
        </span>
        <span className="text-white/40">|</span>
        <span className="text-white/80">
          Sesión: <strong className="text-white">{currentUser.full_name}</strong> ({currentUser.role})
        </span>
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && !isAdminRoute && (
          <Link
            href="/admin"
            className="flex items-center gap-1 text-brand-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded border border-brand-500/30"
          >
            <Settings className="w-3 h-3" />
            Panel Back-Office
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        )}

        {isAdminRoute && (
          <Link
            href="/"
            className="flex items-center gap-1 text-white/80 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded"
          >
            <Store className="w-3 h-3" />
            Ver Tienda Pública
          </Link>
        )}

        <button
          onClick={toggleRole}
          className="flex items-center gap-1 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded cursor-pointer"
          title="Alternar entre Admin y Cliente para comprobar permisos y RLS"
        >
          <UserCheck className="w-3 h-3" />
          Cambiar a {isAdmin ? 'Cliente' : 'Admin'}
        </button>
      </div>
    </aside>
  );
}
