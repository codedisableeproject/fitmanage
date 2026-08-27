import { defineEventHandler } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { dashboardSummary } from '~~/server/utils/dummyData'

// GET /api/dashboard/summary
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/dashboard/summary', () => dashboardSummary())
)
