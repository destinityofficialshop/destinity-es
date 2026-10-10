'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StoreService } from '@/lib/data/store-service';
import { DEMO_ADMIN_USER, DEMO_CUSTOMER_USER } from '@/lib/data/mock-data';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Shield } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const message = searchParams.get('message');

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(message || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    // In demo environment, simulate auth and set profile
    setTimeout(() => {
      const isAdminEmail = email.toLowerCase().includes('admin');
      const user = isAdminEmail ? DEMO_ADMIN_USER : {
        ...DEMO_CUSTOMER_USER,
        email: email || 'usuario@destinity.es',
        full_name: fullName || (email ? email.split('@')[0] : 'Cliente Registrado'),
      };

      StoreService.setCurrentUser(user);
      setLoading(false);
      router.push(isAdminEmail && redirect === '/' ? '/admin' : redirect);
    }, 600);
  };

  const handleQuickDemoLogin = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      StoreService.setCurrentUser(DEMO_ADMIN_USER);
      router.push('/admin');
    } else {
      StoreService.setCurrentUser(DEMO_CUSTOMER_USER);
      router.push('/mi-cuenta');
    }
  };

  return (
    <div className="max-w-md w-full mx-4">
      <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600">
            Acceso a la Plataforma
          </span>
          <h1 className="font-heading text-2xl font-extrabold text-obsidian-950 mt-1">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <p className="text-xs text-obsidian-500 mt-1">
            Destinity ES &bull; Conexión Segura con Supabase Auth
          </p>
        </div>

        {feedback && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
            {feedback}
          </div>
        )}

        {/* Quick Demo Access Bar */}
        <div className="p-3 bg-brand-50 rounded-2xl border border-brand-200 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 block">
            Acceso Rápido de Prueba (Sin contraseña):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="py-2 px-2.5 rounded-xl bg-obsidian-950 hover:bg-black text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              Admin CMS
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('customer')}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-brand-100 text-obsidian-900 border border-brand-300 text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
            >
              <User className="w-3.5 h-3.5 text-brand-600" />
              Cliente Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-obsidian-700 font-medium mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-obsidian-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Carlos Mendoza"
                  className="w-full bg-[#fafaf9] border border-black/10 rounded-xl pl-9 pr-3 py-2.5 text-obsidian-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-obsidian-700 font-medium mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-obsidian-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@destinity.es"
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl pl-9 pr-3 py-2.5 text-obsidian-900 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-obsidian-700 font-medium mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-obsidian-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl pl-9 pr-3 py-2.5 text-obsidian-900 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-obsidian-950 hover:bg-brand-600 text-white font-heading text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Accediendo...' : mode === 'login' ? 'Entrar a mi Cuenta' : 'Crear mi Cuenta'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Google OAuth Mockup */}
        <div className="pt-2 border-t border-black/5">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('customer')}
            className="w-full py-2.5 px-4 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-obsidian-800 text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continuar con Google OAuth
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-obsidian-600">
          {mode === 'login' ? (
            <>
              ¿Aún no eres miembro?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-brand-600 hover:underline"
              >
                Crear una cuenta
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta en Destinity?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-brand-600 hover:underline"
              >
                Iniciar Sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="py-16 bg-[#fafaf9] min-h-[75vh] flex items-center justify-center">
        <Suspense fallback={<div className="text-xs text-obsidian-500">Cargando acceso...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
