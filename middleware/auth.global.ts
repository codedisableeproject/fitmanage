import { useAuth } from '~/composables/useAuth'
import { useGymProfile } from '~/composables/useGymProfile'
import { defineNuxtRouteMiddleware, navigateTo } from '#app'

// Halaman yang boleh diakses TANPA login. google-callback wajib ada di
// sini karena user belum punya sesi sama sekali saat Google baru redirect
// balik ke halaman ini.
const PUBLIC_PATHS = ['/login', '/auth/google-callback']

/**
 * Global middleware — jalan di setiap navigasi (nama file berakhiran
 * `.global.ts`). Urutan cek:
 *  1. Halaman publik (login, google-callback) -> lewat, kecuali user yang
 *     udah login coba buka /login lagi (dilempar ke dashboard).
 *  2. Belum login -> lempar ke /login.
 *  3. Login sebagai OWNER tapi belum isi form kelengkapan gym
 *     (fm_onboarded cookie) -> lempar ke /onboarding, apapun halaman yang
 *     dia tuju. Simulasi "first run" pas register baru (Google atau dev
 *     login), sesuai yang diminta: owner harus lengkapin data gym dulu
 *     sebelum masuk ke dashboard.
 *  4. Bukan owner, atau owner yang udah onboarded, coba buka /onboarding
 *     -> lempar balik ke dashboard (nggak relevan buat mereka).
 */
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn, isOwner } = useAuth()
  const { isOnboarded } = useGymProfile()

  if (PUBLIC_PATHS.includes(to.path)) {
    if (to.path === '/login' && isLoggedIn.value) return navigateTo('/')
    return
  }

  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }

  if (to.path === '/onboarding') {
    if (!isOwner.value || isOnboarded.value) return navigateTo('/')
    return
  }

  // Proteksi tambahan: /settings cuma buat owner, walau link-nya udah
  // disembunyikan dari sidebar buat role lain (usePermissions.ts) — ini
  // jaga-jaga kalau non-owner coba akses langsung lewat URL.
  if (to.path === '/settings' && !isOwner.value) {
    return navigateTo('/')
  }

  if (isOwner.value && !isOnboarded.value) {
    return navigateTo('/onboarding')
  }
})
