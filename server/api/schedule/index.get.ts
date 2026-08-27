import { defineEventHandler } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { schedule } from '~~/server/utils/dummyData'

// GET /api/schedule — jadwal kelas minggu ini
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/schedule', () => ({ items: schedule, total: schedule.length }))
)
