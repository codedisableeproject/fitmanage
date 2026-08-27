import { defineEventHandler, readBody } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'

/**
 * POST /api/auth/login-event
 * ----------------------------
 * Dipanggil composables/useAuth.ts setelah login Google berhasil, untuk
 * kasih tahu backend "user ini baru saja login pakai provider apa & email
 * apa" (dipisah dari proses auth utama supaya bisa dipakai buat
 * analytics/audit log tanpa mengganggu alur login).
 *
 * Mode dummy: cuma di-log ke console server. Kalau BACKEND_BASE_URL sudah
 * di-set, diteruskan ke backend asli lewat proxyOrDummy seperti biasa.
 */
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/auth/login-event', async () => {
    const body = await readBody<{ provider: string; email: string; loggedInAt: string }>(event)
    console.log('[login-event]', body)
    return { received: true }
  })
)
