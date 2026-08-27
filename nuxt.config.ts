// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  ssr: false, // dashboard app, biasanya SPA. Ganti true kalau butuh SSR.
  devtools: { enabled: true },

  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
    '~/assets/scss/main.scss'
  ],

  build: {
    transpile: ['vuetify']
  },

  vite: {
    // @ts-ignore
    ssr: { noExternal: ['vuetify'] }
  },

  modules: [
    (_options: any, nuxt: any) => {
      nuxt.hooks.hook('vite:extendConfig', (config: any) => {
        config.plugins.push(vuetify({ autoImport: true }))
      })
    }
  ],

  components: [
    { path: '~/components/base', prefix: '' },
    '~/components'
  ],

  runtimeConfig: {
    // Server-only. Kalau kosong, server/api/* route pakai dummy data.
    backendBaseUrl: process.env.BACKEND_BASE_URL || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    public: {
      // Client-side. Dipakai untuk deteksi mode dummy di composable/useApi.
      useDummyApi: !process.env.BACKEND_BASE_URL,
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      // Tombol "Masuk sebagai Super Admin (Dev)" di halaman login hanya
      // tampil kalau ini true. Otomatis mati saat build production
      // (`npm run build` set NODE_ENV=production), tapi tetap boleh
      // dipaksa mati manual dengan ALLOW_DEV_LOGIN=false di .env.
      allowDevLogin: process.env.ALLOW_DEV_LOGIN
        ? process.env.ALLOW_DEV_LOGIN === 'true'
        : process.env.NODE_ENV !== 'production'
    }
  },

  app: {
    head: {
      title: 'FitManage',
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }]
    }
  }
})
