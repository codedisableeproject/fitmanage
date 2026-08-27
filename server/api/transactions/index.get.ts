import { defineEventHandler, getQuery } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { transactions } from '~~/server/utils/dummyData'

// GET /api/transactions?page=1&pageSize=10
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/transactions', () => {
    const query = getQuery(event)
    const page = Number(query.page || 1)
    const pageSize = Number(query.pageSize || 10)
    const start = (page - 1) * pageSize
    return {
      items: transactions.slice(start, start + pageSize),
      total: transactions.length,
      page,
      pageSize
    }
  })
)
