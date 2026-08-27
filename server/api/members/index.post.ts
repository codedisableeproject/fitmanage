import { defineEventHandler, readBody } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { members, packages, instructors, transactions } from '~~/server/utils/dummyData'
import type { Member, Transaction } from '~~/server/utils/dummyData'

interface CreateMemberBody {
  name?: string
  email?: string
  phone?: string
  packageId?: string
  // Opsi tambahan instruktur personal training (opsional)
  instructorId?: string
  sessionCount?: number
}

// POST /api/members — buat member baru. Kalau packageId diisi, otomatis
// hitung tanggal expired dari durasi paket & catat transaksi pembayaran
// (type 'membership'). Kalau instructorId + sessionCount juga diisi,
// catat transaksi tambahan (type 'personal-training') — ini yang
// menghubungkan form "Tambah member" ke sistem POS/transaksi.
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/members', async () => {
    const body = await readBody<CreateMemberBody>(event)
    const pkg = packages.find(p => p.id === body.packageId)
    const today = new Date()

    let expiryDate = ''
    if (pkg) {
      const expiry = new Date(today)
      expiry.setMonth(expiry.getMonth() + pkg.durationMonths)
      expiryDate = expiry.toISOString().slice(0, 10)
      pkg.activeMembers += 1
    }

    const newMember: Member = {
      id: 'M-' + String(members.length + 1).padStart(3, '0'),
      name: body.name || 'Member baru',
      email: body.email || '',
      phone: body.phone || '',
      packageName: pkg ? `${pkg.name} - ${pkg.durationMonths} bulan` : '-',
      packageId: pkg?.id,
      joinDate: today.toISOString().slice(0, 10),
      expiryDate,
      status: 'active'
    }
    members.unshift(newMember)

    // --- catat transaksi pembayaran paket ---
    if (pkg) {
      const trx: Transaction = {
        id: 'TRX-' + Date.now(),
        memberName: newMember.name,
        type: 'membership',
        amount: pkg.price,
        date: newMember.joinDate,
        status: 'paid'
      }
      transactions.unshift(trx)
    }

    // --- catat transaksi tambahan instruktur (kalau dipilih) ---
    const instructor = instructors.find(i => i.id === body.instructorId)
    const sessionCount = Number(body.sessionCount || 0)
    if (instructor && sessionCount > 0) {
      const addonTrx: Transaction = {
        id: 'TRX-' + (Date.now() + 1),
        memberName: newMember.name,
        type: 'personal-training',
        amount: instructor.pricePerSession * sessionCount,
        date: newMember.joinDate,
        status: 'paid'
      }
      transactions.unshift(addonTrx)
    }

    return newMember
  })
)
