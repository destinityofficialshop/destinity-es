import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // Let static assets and API routes pass immediately
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return response;
  }

  // Check demo cookie bypass for ease of administration and testing
  const demoRole = request.cookies.get('destinity_demo_role')?.value;

  // 1. Direct authorization via demo session cookie
  if (demoRole === 'admin') {
    // Admin has access to everything (/admin, /mi-cuenta, etc.)
    return response;
  }

  if (demoRole === 'customer') {
    // Customer has access to /mi-cuenta, but NOT to /admin
    if (pathname.startsWith('/admin')) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('message', 'Acceso denegado. Se requiere rol de Administrador.');
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // 2. If no demo cookie is set, verify Supabase Auth session if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const isSupabaseConfigured =
    supabaseUrl &&
    !supabaseUrl.includes('demo') &&
    supabaseAnonKey &&
    !supabaseAnonKey.includes('demo_anon_key');

  if (isSupabaseConfigured) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({ name, value: '', ...options });
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Protected: /mi-cuenta
      if (pathname.startsWith('/mi-cuenta')) {
        if (!user) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = '/login';
          redirectUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(redirectUrl);
        }
        return response;
      }

      // Protected: /admin
      if (pathname.startsWith('/admin')) {
        if (!user) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = '/login';
          redirectUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(redirectUrl);
        }

        // Check role in public.profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile || profile.role !== 'admin') {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = '/login';
          redirectUrl.searchParams.set('message', 'Acceso denegado. Se requiere rol de Administrador.');
          return NextResponse.redirect(redirectUrl);
        }

        return response;
      }
    } catch (error) {
      console.error('Middleware auth check error:', error);
    }
  }

  // 3. Fallback for unauthenticated access to restricted pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/mi-cuenta')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
