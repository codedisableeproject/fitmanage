import { defineEventHandler, readBody, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

/**
 * POST /api/auth/dev-login
 * -------------------------
 * Login instan TANPA Google — 3 role buat development: owner, superuser,
 * operator. Semua pakai domain @example.co.id (dummy, bukan akun asli).
 *
 * Otomatis nonaktif kalau runtimeConfig.public.allowDevLogin = false
 * (default-nya mati sendiri saat production build, lihat nuxt.config.ts).
 */
const DEV_USERS = {
  owner: {
    id: 'U-OWNER',
    name: 'Owner Gym',
    email: 'owner@example.co.id',
    avatar: null,
    role: 'owner',
    provider: 'dev'
  },
  superuser: {
    id: 'U-SUPERUSER',
    name: 'Super User',
    email: 'superuser@example.co.id',
    avatar: null,
    role: 'superuser',
    provider: 'dev'
  },
  operator: {
    id: 'U-OPERATOR',
    name: 'Operator',
    email: 'operator@example.co.id',
    avatar: null,
    role: 'operator',
    provider: 'dev'
  }
} as const

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.public.allowDevLogin) {
    throw createError({ statusCode: 403, statusMessage: 'Dev login dimatikan di environment ini.' })
  }

  const body = await readBody<{ role?: keyof typeof DEV_USERS }>(event)
  const role = body?.role && DEV_USERS[body.role] ? body.role : 'owner'

  await new Promise((r) => setTimeout(r, 200))

  return {
    token: `dummy-jwt-token-${role}-` + Date.now(),
    user: DEV_USERS[role]
  }
})
