import { useTheme as useVuetifyTheme } from 'vuetify'
import { useCookie } from '#imports'

export type ThemeName = 'dark-violet' | 'light' | 'blue-sky'

export interface ThemeMeta {
  label: string
  swatch: string
  vuetifyName: string
}

export const THEME_LIST: Record<ThemeName, ThemeMeta> = {
  'dark-violet': { label: 'Dark Violet', swatch: '#7C6FEA', vuetifyName: 'darkViolet' },
  'light': { label: 'Light', swatch: '#6D28D9', vuetifyName: 'light' },
  'blue-sky': { label: 'Blue Sky', swatch: '#0EA5E9', vuetifyName: 'blueSky' }
}

/**
 * useAppTheme
 * -----------
 * Satu sumber kebenaran untuk tema aplikasi. Mengatur 3 hal sekaligus
 * setiap kali ganti tema:
 *  1. Cookie `fm_theme` — supaya persist antar sesi/refresh.
 *  2. Atribut `data-theme` di <html> — men-trigger CSS custom property
 *     di assets/scss/_theme-tokens.scss (dipakai semua base component).
 *  3. `vuetifyTheme.global.name` — supaya komponen Vuetify (v-btn,
 *     v-select, v-chip, dst) ikut berubah juga.
 *
 * Panggil `initTheme()` sekali di root layout (mounted) untuk apply
 * tema yang tersimpan di cookie saat pertama kali app dibuka.
 */
export function useAppTheme() {
  const current = useCookie<ThemeName>('fm_theme', { default: () => 'dark-violet' })
  const vuetifyTheme = useVuetifyTheme()

  function setTheme(name: ThemeName) {
    current.value = name
    if (import.meta.client) {
      document.documentElement.setAttribute('data-theme', name)
    }
    vuetifyTheme.global.name.value = THEME_LIST[name].vuetifyName
  }

  function initTheme() {
    setTheme(current.value)
  }

  return { current, themes: THEME_LIST, setTheme, initTheme }
}
