import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Single source of truth for the deployed origin. Set VITE_SITE_URL in your host
// (Vercel/Netlify env or a local .env) and every canonical / OG / Twitter / JSON-LD
// URL in index.html is filled from it — no scattered `your-domain.com` to miss.
const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://your-domain.com').replace(/\/$/, '')

function siteUrl(): Plugin {
  return {
    name: 'site-url',
    transformIndexHtml(html) {
      if (SITE_URL.includes('your-domain.com')) {
        this.warn?.(
          'VITE_SITE_URL is not set — SEO/OG tags fall back to the your-domain.com placeholder.',
        )
      }
      return html.replaceAll('%SITE_URL%', SITE_URL)
    },
    // robots.txt + sitemap.xml are generated from the same SITE_URL at build
    // time (not shipped as static placeholders that can drift out of sync).
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.w3.org/sitemaps/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), siteUrl()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
