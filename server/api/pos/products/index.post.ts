import { defineEventHandler, readBody } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { createPosProduct } from '~~/server/utils/dummyData'
import type { PosProduct } from '~~/server/utils/dummyData'

// POST /api/pos/products — tambah produk master data baru (suplemen / kulkas)
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/pos/products', async () => {
    const body = await readBody<Omit<PosProduct, 'id'>>(event)
    return createPosProduct(body)
  })
)
