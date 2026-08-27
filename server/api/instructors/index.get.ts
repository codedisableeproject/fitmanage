import { defineEventHandler } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { instructors } from '~~/server/utils/dummyData'

// GET /api/instructors — daftar instruktur gym (dipakai di form tambah
// member, opsi tambahan personal training)
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/instructors', () => ({ items: instructors, total: instructors.length }))
)
