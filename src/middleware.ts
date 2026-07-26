import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/supabase';

// Semua path yang diawali /admin (kecuali /admin/login) wajib login.
// Kalau belum login, redirect ke halaman login admin.
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';

  if (isAdminRoute) {
    const session = await getSession(context.cookies);
    if (!session) {
      return context.redirect('/admin/login');
    }
    context.locals.session = session;
  }

  return next();
});
