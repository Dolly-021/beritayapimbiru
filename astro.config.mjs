import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

// SSR (output: 'server') dipakai karena halaman /admin butuh cek sesi login
// di server sebelum halaman dikirim ke browser.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind()],
});
