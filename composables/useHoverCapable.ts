import { ref, onMounted, onUnmounted } from 'vue'

/**
 * useHoverCapable
 * ---------------
 * Deteksi apakah device beneran punya "hover" (mouse desktop) atau nggak
 * (touch/HP). Dipakai buat nyalain fitur open-on-hover di v-menu (tooltip
 * label & flyout submenu di sidebar rail mode) CUMA di device yang
 * beneran bisa hover.
 *
 * Kenapa penting: di touch device, tap disimulasikan browser sebagai
 * "hover" sesaat TAPI nggak pernah ada event "hover keluar" beneran
 * (nggak ada mouse yang bisa "pergi"). Akibatnya kalau open-on-hover
 * dipaksa nyala di HP, tooltip/flyout-nya kebuka pas di-tap terus
 * NYANGKUT nggak pernah nutup sendiri — biarpun navigasi/klik-nya sendiri
 * tetap jalan normal di baliknya.
 *
 * Pakai CSS media query `(hover: hover) and (pointer: fine)` — ini yang
 * dipakai browser buat nentuin device beneran punya mouse presisi atau
 * jari/touch yang kasar.
 */
export function useHoverCapable() {
  const supportsHover = ref(true)

  let mql: MediaQueryList | null = null
  function handleChange(e: MediaQueryListEvent) {
    supportsHover.value = e.matches
  }

  onMounted(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    mql = window.matchMedia('(hover: hover) and (pointer: fine)')
    supportsHover.value = mql.matches
    mql.addEventListener('change', handleChange)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', handleChange)
  })

  return { supportsHover }
}
