import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { defineNuxtPlugin } from '#app'

// Warna di sini sengaja di-hardcode (Vuetify tidak baca CSS var untuk
// theme.colors saat init) tapi NILAINYA harus selalu disamakan manual
// dengan assets/scss/_theme-tokens.scss supaya komponen custom (base/*)
// dan komponen Vuetify (v-btn, v-select, dst) terlihat konsisten.
//
// Nama tema di sini ('darkViolet', 'light', 'blueSky') dipetakan ke
// data-theme ('dark-violet', 'light', 'blue-sky') di composables/useAppTheme.ts.
export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'darkViolet',
      themes: {
        darkViolet: {
          dark: true,
          colors: {
            primary: '#7C6FEA',
            'primary-darken-1': '#6355D6',
            secondary: '#B7B6D6',
            error: '#F2555A',
            success: '#34D399',
            warning: '#FBBF24',
            background: '#0B0B14',
            surface: '#17172A'
          }
        },
        light: {
          dark: false,
          colors: {
            primary: '#6D28D9',
            'primary-darken-1': '#5B21B6',
            secondary: '#5B5A72',
            error: '#DC2626',
            success: '#16A34A',
            warning: '#D97706',
            background: '#F5F5FA',
            surface: '#FFFFFF'
          }
        },
        blueSky: {
          dark: false,
          colors: {
            primary: '#0EA5E9',
            'primary-darken-1': '#0284C7',
            secondary: '#475569',
            error: '#DC2626',
            success: '#059669',
            warning: '#D97706',
            background: '#F0F9FF',
            surface: '#FFFFFF'
          }
        }
      }
    },
    defaults: {
      VBtn: { style: 'text-transform: none; letter-spacing: 0;' },
      VTextField: { variant: 'outlined', density: 'compact', hideDetails: 'auto' },
      VSelect: { variant: 'outlined', density: 'compact', hideDetails: 'auto' },
      VAutocomplete: { variant: 'outlined', density: 'compact', hideDetails: 'auto' }
    }
  })

  nuxtApp.vueApp.use(vuetify)
})
