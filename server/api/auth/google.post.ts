import { defineEventHandler, readBody, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

/**
 * POST /api/auth/google
 * ----------------------
 * Terima { code, redirectUri } — hasil Authorization Code dari Google
 * OAuth (bukan credential/id_token popup), dikirim oleh
 * composables/useAuth.ts -> completeGoogleLogin() setelah Google redirect
 * balik ke /auth/google-callback.
 *
 * Prioritas:
 *  1. BACKEND_BASE_URL di-set  -> diteruskan ke backend asli, backend yang
 *     urus tukar code ke token & bikin sesi aplikasi sendiri.
 *  2. Belum ada backend, TAPI GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
 *     sudah di-set -> server INI langsung tukar code ke Google (OAuth
 *     beneran, client_secret aman karena tidak pernah ke browser), ambil
 *     profil asli user, balikin sesi dummy yang membungkus data Google
 *     asli. Jadi login Google sungguhan bisa dites sebelum backend jadi.
 *  3. Keduanya belum ada -> error jelas, arahkan pakai dev login.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ code?: string; redirectUri?: string }>(event)

  if (!body?.code) {
    throw createError({ statusCode: 400, statusMessage: 'Missing authorization code' })
  }

  // --- 1. Ada backend asli ---
  if (config.backendBaseUrl) {
    return await $fetch('/auth/google', {
      baseURL: config.backendBaseUrl,
      method: 'POST',
      body
    })
  }

  // --- 2. Belum ada backend, tapi Google credential sudah di-set ---
  if (config.public.googleClientId && config.googleClientSecret) {
    try {
      const tokenRes = await $fetch<{ access_token: string; id_token: string }>(
        'https://oauth2.googleapis.com/token',
        {
          method: 'POST',
          body: {
            code: body.code,
            client_id: config.public.googleClientId,
            client_secret: config.googleClientSecret,
            redirect_uri: body.redirectUri,
            grant_type: 'authorization_code'
          }
        }
      )

      const profile = await $fetch<{ sub: string; email: string; name: string; picture: string }>(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { authorization: `Bearer ${tokenRes.access_token}` } }
      )

      return {
        // TODO (kalau backend sudah jadi): token ini seharusnya sesi dari
        // backend (mis. JWT yang backend keluarkan setelah verifikasi
        // profile.email), bukan string dummy seperti sekarang.
        token: 'dummy-jwt-token-' + Date.now(),
        user: {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          avatar: profile.picture || null,
          // Role default 'owner': orang yang register lewat Google diasumsikan
          // sebagai pemilik gym yang lagi setup awal (lihat middleware
          // onboarding di middleware/auth.global.ts + pages/onboarding.vue).
          role: 'owner',
          provider: 'google'
        }
      }
    } catch (err: any) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Gagal verifikasi login Google: ' + (err?.data?.error_description || err.message)
      })
    }
  }

  // --- 3. Belum ada backend maupun Google credential ---
  throw createError({
    statusCode: 500,
    statusMessage: 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET belum di-set di .env. Gunakan "Masuk sebagai Super Admin (Dev)" selama development, atau lengkapi env sesuai README.'
  })
})
