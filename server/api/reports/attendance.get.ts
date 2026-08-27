import { defineEventHandler } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { classAttendance } from '~~/server/utils/dummyData'

// GET /api/reports/attendance — kehadiran per kelas
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/reports/attendance', () => ({ items: classAttendance }))
)
