import { defineEventHandler } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { revenueTrend } from '~~/server/utils/dummyData'

// GET /api/reports/revenue — tren pendapatan 6 bulan terakhir
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/reports/revenue', () => ({ items: revenueTrend }))
)
