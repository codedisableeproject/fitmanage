<script setup lang="ts">
import type { TableHeader } from '~/components/base/TableBase.vue'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'default' })

interface Transaction {
  id: string
  memberName: string
  type: 'membership' | 'personal-training' | 'merchandise'
  amount: number
  date: string
  status: 'paid' | 'pending' | 'refunded'
}

const api = useApi()
const headers: TableHeader[] = [
  { title: 'ID transaksi', key: 'id' },
  { title: 'Member', key: 'memberName' },
  { title: 'Jenis', key: 'type' },
  { title: 'Tanggal', key: 'date' },
  { title: 'Jumlah', key: 'amount', align: 'end' },
  { title: 'Status', key: 'status' }
]

const items = ref<Transaction[]>([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)

async function load() {
  loading.value = true
  try {
    const res = await api.get<{ items: Transaction[]; total: number }>('/transactions', { query: { page: page.value, pageSize: 10 } })
    items.value = res.items
    total.value = res.total
  } finally {
    loading.value = false
  }
}
watch(page, load)
onMounted(load)

const typeLabel: Record<Transaction['type'], string> = {
  membership: 'Membership',
  'personal-training': 'Personal training',
  merchandise: 'Merchandise'
}
const statusColor: Record<Transaction['status'], string> = {
  paid: 'success',
  pending: 'warning',
  refunded: 'error'
}
const statusLabel: Record<Transaction['status'], string> = {
  paid: 'Lunas',
  pending: 'Menunggu',
  refunded: 'Refund'
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <div>
    <HeaderBase title="Transaksi & pembayaran" subtitle="Riwayat transaksi member gym Anda." />

    <div style="padding: 0 24px 24px;">
      <TableBase :headers="headers" :items="items" :loading="loading" :page="page" :total="total" @update:page="page = $event">
        <template #item.type="{ value }">{{ typeLabel[value as Transaction['type']] }}</template>
        <template #item.amount="{ value }">{{ formatCurrency(value) }}</template>
        <template #item.status="{ value }">
          <v-chip size="small" :color="statusColor[value as Transaction['status']]" variant="flat">
            {{ statusLabel[value as Transaction['status']] }}
          </v-chip>
        </template>
      </TableBase>
    </div>
  </div>
</template>
