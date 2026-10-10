# Destinity ES — Arquitectura & Plataforma E-Commerce / CMS

Plataforma de comercio electrónico de alta gama inspirada en la modularidad y gestión de back-office de CMS consagrados (WooCommerce / Joomla), construida sobre un stack moderno, reactivo y ultrarrápido con **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Zustand**, **Supabase** (PostgreSQL, Storage, RLS) y **Resend**.

---

## 1. Identidad Visual y Experiencia de Usuario (UI/UX)
- **Marca**: Destinity ES.
- **Estética**: Editorial minimalista, limpia y sofisticada con acentos de lujo en oro champán (`#b89053`) sobre fondos obsidian y blanco hueso.
- **Tipografía**:
  - Encabezados: Google Font **Syne** con personalidad vanguardista.
  - Textos y cuerpo: Google Font **Plus Jakarta Sans** para legibilidad y elegancia contemporánea.
- **Microinteracciones**: Framer Motion en botones, badges de descuento interactivos, drawer lateral deslizante y feedback dinámico de carga.

---

## 2. Estructura y Arquitectura del Proyecto

```
destinity-es/
├── src/
│   ├── app/
│   │   ├── (Storefront)
│   │   │   ├── page.tsx                     # Escaparate principal (Hero, Categorías, Destacados, Editorial)
│   │   │   ├── productos/
│   │   │   │   ├── page.tsx                 # Catálogo interactivo (Filtros, ordenación, stock)
│   │   │   │   └── [slug]/page.tsx          # Ficha de producto (Galería, variantes dinámicas, specs)
│   │   │   ├── carrito/page.tsx             # Carrito completo y cálculo de portes
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx                 # Pasarela multi-método (Stripe, Bizum España, PayPal)
│   │   │   │   └── success/page.tsx         # Confirmación, confeti y descarga de factura
│   │   │   ├── mi-cuenta/page.tsx           # Área de cliente (Historial, seguimiento, PDF, direcciones)
│   │   │   └── login/page.tsx               # Supabase Auth con OAuth y simulador de roles
│   │   ├── admin/                           # Panel Back-Office CMS (Protegido por Middleware)
│   │   │   ├── layout.tsx                   # Sidebar de navegación y métricas
│   │   │   ├── page.tsx                     # Dashboard KPI (Ventas, stock bajo, pedidos)
│   │   │   ├── productos/
│   │   │   │   ├── page.tsx                 # Tabla interactiva de catálogo con switch de estado
│   │   │   │   ├── nuevo/page.tsx           # Crear producto (Auto-slug, variantes, drag & drop)
│   │   │   │   └── [id]/page.tsx            # Edición de producto
│   │   │   ├── pedidos/page.tsx             # Gestión logística, regeneración PDF y reenvío con Resend
│   │   │   └── ajustes/page.tsx             # Datos fiscales (CIF/NIF, 21% IVA, portes)
│   │   └── api/
│   │       ├── invoices/[orderId]/route.ts  # Endpoint de generación y descarga de factura oficial en PDF
│   │       └── send-order-email/route.ts    # Transaccional Resend con adjunto PDF y alerta de administrador
│   ├── components/
│   │   ├── common/AdminBar.tsx              # Barra superior de acceso rápido al CMS y selector de rol
│   │   ├── layout/Header.tsx                # Cabecera flotante glassmorphism con buscador en tiempo real
│   │   ├── layout/Footer.tsx                # Pie editorial con datos societarios y sellos de pago
│   │   ├── cart/CartDrawer.tsx              # Drawer lateral con barra de progreso de envío gratis
│   │   ├── product/ProductCard.tsx          # Tarjeta interactiva con hover dinámico y add rápido
│   │   └── admin/ProductForm.tsx            # Formulario modular de producto con variantes y tags
│   ├── lib/
│   │   ├── data/
│   │   │   ├── mock-data.ts                 # Dataset inicial de alta calidad editorial
│   │   │   └── store-service.ts             # Capa de repositorio unificada (Supabase + persistencia)
│   │   ├── pdf/invoice-generator.ts         # Generador de facturas fiscales simplificadas (A4)
│   │   ├── store/cart-store.ts              # Zustand store con cálculo de IVA al 21% y portes
│   │   └── supabase/
│   │       ├── client.ts                    # Cliente navegador de Supabase SSR
│   │       ├── server.ts                    # Cliente servidor de Supabase SSR
│   │       └── middleware.ts                # Middleware para actualización de sesión y rutas
│   ├── types/
│   │   ├── database.types.ts                # Tipos TypeScript de tablas PostgreSQL
│   │   └── store.types.ts                   # Tipos de carrito y checkout
│   ├── middleware.ts                        # Protección de rutas `/admin` y `/mi-cuenta`
│   └── supabase/schema.sql                  # Script SQL completo de migración, RLS y Storage
```

---

## 3. Infraestructura Backend & Base de Datos (Supabase)

El archivo `supabase/schema.sql` contiene todo el DDL necesario:

1. **Tablas Estructuradas**:
   - `profiles`: Vinculada a `auth.users` mediante triggers, almacena rol (`admin` | `customer`), direcciones en formato JSONB.
   - `categories`: Colecciones con slug único y orden visual.
   - `products`: Título, slug, precio, precio rebajado, SKU, stock, estado publicado/borrador, tags, variantes dinámicas (JSONB) y atributos.
   - `orders`: Número de pedido (`DES-2026-XXXX`), método de pago, desglose impositivo y direcciones completas.
   - `order_items`: Desglose de cada línea con variantes seleccionadas.
   - `invoices`: Registro de factura simplificada correlativa (`INV-2026-XXXX`) y ruta en bucket.
   - `store_settings`: Registro singleton con CIF, domicilio fiscal, IVA aplicable y gastos de envío.

2. **Políticas RLS (Row Level Security)**:
   - Los clientes solo pueden consultar y descargar sus propios pedidos y facturas.
   - Los administradores tienen acceso global de lectura y modificación.
   - Los productos publicados son de libre consulta pública.

3. **Storage Buckets**:
   - `product-images`: Público para visualización rápida de fotos de catálogo.
   - `invoices`: Privado con acceso restringido para PDFs de facturas fiscales.

---

## 4. Pasarelas de Pago adaptadas a España
El flujo de checkout implementa:
- **Tarjeta Bancaria (Stripe Elements UI)**: Con validación de numeración y fecha de caducidad.
- **Bizum**: Flujo exclusivo para el mercado español solicitando número móvil de 9 dígitos y simulación de cargo instantáneo.
- **PayPal**: Smart Checkout y pago aplazado.
- **Apple Pay & Google Pay**: Cobro acelerado biométrico.

---

## 5. Facturación PDF y Notificaciones por Email (Resend)
- **Generación de Factura**: Crea documentos A4 con formato oficial español:
  - Logotipo y datos fiscales de la sociedad (CIF: B-88776655, Paseo de la Castellana 140, Madrid).
  - Datos de cliente y DNI/NIF para desgravación fiscal.
  - Desglose de base imponible, 21% de IVA y total.
  - Leyenda registral al pie de página.
- **Webhook / API Route (`/api/send-order-email`)**:
  - Disparado tras el pago para adjuntar el PDF generado y notificar al cliente vía Resend.
  - Alerta paralela a la dirección de administración con el importe y método utilizado.

---

## 6. Puesta en Marcha Local

### Prerrequisitos:
- Node.js >= 18
- npm o pnpm

### Pasos:
1. Clonar el repositorio o situarse en el directorio:
   ```bash
   cd destinity-es
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno en `.env.local` (opcional, el proyecto incluye modo demo plenamente operativo sin configuración previa):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   RESEND_API_KEY=tu_clave_resend_aqui
   ```
4. Ejecutar servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.
