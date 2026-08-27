import { defineEventHandler, getQuery } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { posProducts } from '~~/server/utils/dummyData'

// GET /api/pos/products?category=supplement|food-drink (opsional)
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/pos/products', () => {
    const query = getQuery(event)
    const category = query.category as string | undefined
    const items = category ? posProducts.filter(p => p.category === category) : posProducts
    return { items, total: items.length }
  })
)
