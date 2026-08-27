import { defineEventHandler } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { packages } from '~~/server/utils/dummyData'

// GET /api/memberships — daftar paket membership
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/memberships', () => ({ items: packages, total: packages.length }))
)
