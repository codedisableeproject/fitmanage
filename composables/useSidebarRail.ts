import { useCookie } from '#imports'

/**
 * useSidebarRail
 * --------------
 * State buka/tutup sidebar ("rail mode" — Vuetify punya konsep ini
 * built-in: sidebar menyempit jadi lebar icon doang, label disembunyikan).
 * Disimpan di cookie supaya kepilih tetap sama walau refresh.
 */
export function useSidebarRail() {
  const railMode = useCookie<boolean>('fm_sidebar_rail', { default: () => false })

  function toggle() {
    railMode.value = !railMode.value
  }

  return { railMode, toggle }
}
