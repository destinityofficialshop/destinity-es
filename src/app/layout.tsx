import type { Metadata } from 'next';
import { Syne, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { AdminBar } from '@/components/common/AdminBar';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Destinity ES — Alta Marroquinería & Sastrería Contemporánea',
  description: 'Plataforma oficial de comercio electrónico de Destinity ES. Diseño editorial minimalista, materiales nobles y confección artesanal en España.',
  keywords: ['Destinity ES', 'lujo silencioso', 'marroquinería', 'sastrería', 'España', 'moda de autor'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${syne.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#fafaf9] text-obsidian-900 antialiased selection:bg-brand-500 selection:text-white">
        <AdminBar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <CartDrawer />
      </body>
    </html>
  );
}
