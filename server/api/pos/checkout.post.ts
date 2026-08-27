import { defineEventHandler, readBody, createError } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { posProducts, transactions } from '~~/server/utils/dummyData'
import type { Transaction } from '~~/server/utils/dummyData'

interface CheckoutItem { productId: string; qty: number }
interface CheckoutBody { items: CheckoutItem[]; memberName?: string }

// POST /api/pos/checkout — proses transaksi kasir: kurangin stok produk,
// catat sebagai Transaction (type: 'merchandise') supaya nongol juga di
// halaman Transaksi & Pembayaran / Laporan Pendapatan.
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/pos/checkout', async () => {
    const body = await readBody<CheckoutBody>(event)
    if (!body?.items?.length) {
      throw createError({ statusCode: 400, statusMessage: 'Keranjang kosong' })
    }

    let total = 0
    for (const line of body.items) {
      const product = posProducts.find(p => p.id === line.productId)
      if (!product) {
        throw createError({ statusCode: 404, statusMessage: `Produk ${line.productId} tidak ditemukan` })
      }
      if (product.stock < line.qty) {
        throw createError({ statusCode: 400, statusMessage: `Stok ${product.name} tidak cukup` })
      }
      total += product.price * line.qty
    }

    // Semua item valid -> baru kurangin stok (biar nggak ada perubahan
    // parsial kalau salah satu item gagal validasi).
    for (const line of body.items) {
      const product = posProducts.find(p => p.id === line.productId)!
      product.stock -= line.qty
    }

    const trx: Transaction = {
      id: 'TRX-' + Date.now(),
      memberName: body.memberName || 'Walk-in customer',
      type: 'merchandise',
      amount: total,
      date: new Date().toISOString().slice(0, 10),
      status: 'paid'
    }
    transactions.unshift(trx)

    return { transaction: trx, total }
  })
)
