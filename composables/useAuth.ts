import { computed } from 'vue'
import { useCookie, useRuntimeConfig, navigateTo } from '#imports'

export type UserRole = 'owner' | 'superuser' | 'operator'

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar: string | null
  role: UserRole | string
  provider: 'google' | 'dev'
}

// Halaman ini yang didaftarkan sebagai "Authorized redirect URI" di Google
// Cloud Console (digabung dengan origin saat runtime, lihat redirectToGoogle()).
const GOOGLE_CALLBACK_PATH = '/auth/google-callback'

/**
 * useAuth
 * -------
 * Session disimpan di cookie (bukan localStorage) supaya aman dibaca ulang
 * saat refresh.
 *
 * ALUR LOGIN GOOGLE (Authorization Code flow — redirect asli, bukan popup):
 *   1. User klik "Continue with Google" -> redirectToGoogle() melempar
 *      browser ke accounts.google.com (butuh GOOGLE_CLIENT_ID di .env).
 *   2. User approve di sana, Google redirect balik ke
 *      /auth/google-callback?code=xxxxx
 *   3. pages/auth/google-callback.vue baca `code`, panggil
 *      completeGoogleLogin(code) di bawah.
 *   4. completeGoogleLogin() kirim code ke POST /api/auth/google (server
 *      yang tukar code -> token ke Google, client_secret aman karena
 *      cuma ada di server — lihat server/api/auth/google.post.ts). User
 *      hasil login Google selalu diberi role 'owner' (asumsi: yang
 *      register pertama kali adalah pemilik gym).
 *   5. Setelah dapat sesi, otomatis kirim POST /api/auth/login-event supaya
 *      backend tahu "user ini baru saja login pakai Google, emailnya apa".
 *
 * ROLE: 3 role dipakai di app ini — 'owner' (akses semua menu), 'superuser'
 * (operasional + laporan, tanpa pengaturan gym), 'operator' (operasional
 * harian doang: POS, member, jadwal). Lihat composables/usePermissions.ts
 * buat detail menu apa aja yang keblok per role.
 *
 * DEV LOGIN (loginAsDev): jalan pintas tanpa Google sama sekali, khusus
 * development — pilih salah satu dari 3 role di atas, semua pakai email
 * dummy @example.co.id. Lihat server/api/auth/dev-login.post.ts.
 */
export function useAuth() {
  const token = useCookie<string | null>('fm_token', { default: () => null })
  const user = useCookie<AuthUser | null>('fm_user', { default: () => null })
  const config = useRuntimeConfig()

  const isLoggedIn = computed(() => !!token.value)
  const isOwner = computed(() => user.value?.role === 'owner')
  const googleClientId = config.public.googleClientId as string
  const allowDevLogin = config.public.allowDevLogin as boolean

  /** Redirect PENUH ke halaman login Google (bukan popup/dummy). */
  function redirectToGoogle() {
    if (!googleClientId) {
      throw new Error(
        'GOOGLE_CLIENT_ID belum di-set di .env. Isi dulu (lihat README bagian "Setup Google OAuth"), atau pakai salah satu tombol "Masuk sebagai ..." (Dev) selama development.'
      )
    }
    const redirectUri = `${window.location.origin}${GOOGLE_CALLBACK_PATH}`
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account'
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  /** Dipanggil dari pages/auth/google-callback.vue setelah Google redirect balik dengan ?code=... */
  async function completeGoogleLogin(code: string) {
    const redirectUri = `${window.location.origin}${GOOGLE_CALLBACK_PATH}`
    const res = await $fetch<{ token: string; user: AuthUser }>('/api/auth/google', {
      method: 'POST',
      body: { code, redirectUri }
    })
    token.value = res.token
    user.value = res.user

    // Kabari backend bahwa user ini login pakai Google (dipisah dari proses
    // auth itu sendiri supaya backend bisa treat sebagai event/audit log,
    // bukan bagian penentu sukses-tidaknya login). Gagal kirim event TIDAK
    // boleh menggagalkan login yang sudah berhasil.
    try {
      await $fetch('/api/auth/login-event', {
        method: 'POST',
        body: { provider: 'google', email: res.user.email, loggedInAt: new Date().toISOString() }
      })
    } catch {
      // no-op — non-blocking
    }

    return res.user
  }

  /**
   * Jalan pintas dev: login langsung sebagai salah satu dari 3 role
   * (owner/superuser/operator) tanpa Google sama sekali. HANYA aktif
   * kalau runtimeConfig.public.allowDevLogin true (otomatis mati di
   * production build — lihat nuxt.config.ts).
   */
  async function loginAsDev(role: UserRole) {
    if (!allowDevLogin) {
      throw new Error('Dev login dimatikan di environment ini.')
    }
    const res = await $fetch<{ token: string; user: AuthUser }>('/api/auth/dev-login', {
      method: 'POST',
      body: { role }
    })
    token.value = res.token
    user.value = res.user
    return res.user
  }

  function logout() {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  return {
    token,
    user,
    isLoggedIn,
    isOwner,
    googleClientId,
    allowDevLogin,
    redirectToGoogle,
    completeGoogleLogin,
    loginAsDev,
    logout
  }
}
