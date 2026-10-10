'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Truck, RefreshCw, Mail } from 'lucide-react';

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="bg-obsidian-950 text-white pt-16 pb-10 border-t border-white/10 mt-auto">
      {/* Guarantees Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold tracking-wide">Envío Asegurado 24/48h</h4>
              <p className="text-xs text-obsidian-400">Entrega rápida en toda la Península y Baleares con SEUR</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold tracking-wide">Devoluciones Gratuitas</h4>
              <p className="text-xs text-obsidian-400">Dispones de 14 días para cambios o reembolsos íntegros</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold tracking-wide">Autenticidad & Calidad</h4>
              <p className="text-xs text-obsidian-400">Materiales nobles seleccionados y certificado oficial</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-extrabold tracking-widest text-white">
                DESTINITY
              </span>
              <span className="text-xs font-bold tracking-widest text-brand-400 uppercase px-1.5 py-0.5 bg-brand-950/80 rounded border border-brand-500/40">
                ES
              </span>
            </div>
            <p className="text-sm text-obsidian-300 leading-relaxed max-w-sm">
              Inspirados en la sastrería arquitectónica y la marroquinería artesanal española. Creaciones contemporáneas de elegancia sobria concebidas para perdurar.
            </p>
            <div className="text-xs text-obsidian-400 space-y-1 pt-2">
              <p>Destinity Luxury Goods S.L. &bull; CIF: B-88776655</p>
              <p>Paseo de la Castellana 140, 28046 Madrid &bull; España</p>
              <p>contacto@destinity.es &bull; +34 910 00 22 33</p>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="space-y-3">
            <h5 className="font-heading text-sm font-bold text-white tracking-wider uppercase">
              Colecciones
            </h5>
            <ul className="space-y-2 text-sm text-obsidian-400">
              <li>
                <Link href="/productos?categoria=moda-sastreria" className="hover:text-brand-400 transition-colors">
                  Moda & Sastrería
                </Link>
              </li>
              <li>
                <Link href="/productos?categoria=marroquineria-cuero" className="hover:text-brand-400 transition-colors">
                  Marroquinería & Cuero
                </Link>
              </li>
              <li>
                <Link href="/productos?categoria=alta-relojeria" className="hover:text-brand-400 transition-colors">
                  Alta Relojería & Joyas
                </Link>
              </li>
              <li>
                <Link href="/productos?categoria=aromas-lifestyle" className="hover:text-brand-400 transition-colors">
                  Aromas & Lifestyle
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-brand-400 transition-colors">
                  Ver Todo el Catálogo
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & CMS */}
          <div className="space-y-3">
            <h5 className="font-heading text-sm font-bold text-white tracking-wider uppercase">
              Atención & Legal
            </h5>
            <ul className="space-y-2 text-sm text-obsidian-400">
              <li>
                <Link href="/mi-cuenta" className="hover:text-brand-400 transition-colors">
                  Área de Cliente
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-400 transition-colors text-brand-300">
                  Panel Back-office CMS
                </Link>
              </li>
              <li>
                <a href="#terminos" className="hover:text-brand-400 transition-colors">
                  Condiciones de Compra
                </a>
              </li>
              <li>
                <a href="#privacidad" className="hover:text-brand-400 transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#cookies" className="hover:text-brand-400 transition-colors">
                  Política de Cookies
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h5 className="font-heading text-sm font-bold text-white tracking-wider uppercase">
              Club Privado
            </h5>
            <p className="text-xs text-obsidian-400 leading-relaxed">
              Recibe invitaciones a ventas privadas, nuevas ediciones limitadas y el boletín editorial mensual.
            </p>
            {subscribed ? (
              <div className="p-3 bg-brand-950/70 border border-brand-500/40 rounded-xl text-xs text-brand-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>Gracias por suscribirse. Le hemos enviado una confirmación.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <Mail className="w-4 h-4 text-obsidian-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Tu correo electrónico"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-obsidian-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-obsidian-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  Suscribirme
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Legal & Payment Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-obsidian-400">
        <div>
          &copy; {new Date().getFullYear()} Destinity ES. Todos los derechos reservados. Desarrollado con Next.js + Supabase.
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-wider text-obsidian-500">Pasarelas en España:</span>
          <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">VISA</span>
          <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Mastercard</span>
          <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold text-[10px] border border-brand-500/40">Bizum</span>
          <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">PayPal</span>
          <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Apple Pay</span>
        </div>
      </div>
    </footer>
  );
}
