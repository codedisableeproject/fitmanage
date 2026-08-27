<script setup lang="ts">
import type { TableHeader } from '~/components/base/TableBase.vue'
import { usePosProducts } from '~/composables/usePosProducts'
import { useNotif } from '~/composables/useNotif'

definePageMeta({ layout: 'default' })

const { items, loading, load, create } = usePosProducts('food-drink')
const notif = useNotif()

onMounted(load)

const headers: TableHeader[] = [
  { title: 'Nama item', key: 'name' },
  { title: 'Harga', key: 'price', align: 'end' },
  { title: 'Stok', key: 'stock', align: 'end' },
  { title: 'Satuan', key: 'unit' }
]

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

// --- tambah item dialog ---
const showCreate = ref(false)
const form = reactive({ name: '', price: 0, stock: 0, unit: 'botol' })
const submitting = ref(false)

function resetForm() {
  form.name = ''; form.price = 0; form.stock = 0; form.unit = 'botol'
}

async function submitProduct() {
  if (!form.name || form.price <= 0) {
    notif.warning('Nama item dan harga wajib diisi')
    return
  }
  submitting.value = true
  try {
    await create({ name: form.name, price: form.price, stock: form.stock, unit: form.unit })
    notif.success('Item kulkas ditambahkan')
    showCreate.value = false
    resetForm()
  } catch {
    notif.error('Gagal menambahkan item')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <HeaderBase title="Master Data Kulkas" subtitle="Kelola stok makanan & minuman di kulkas gym.">
      <template #actions>
        <ButtonBase icon="mdi-plus" @click="showCreate = true">Tambah item</ButtonBase>
      </template>
    </HeaderBase>

    <div style="padding: 0 24px 24px;">
      <TableBase :headers="headers" :items="items" :loading="loading" :page="1" :total="items.length">
        <template #item.price="{ value }">{{ formatCurrency(value) }}</template>
        <template #item.stock="{ value }">
          <v-chip size="small" :color="value > 10 ? 'success' : value > 0 ? 'warning' : 'error'" variant="flat">
            {{ value }}
          </v-chip>
        </template>
      </TableBase>
    </div>

    <DialogBase v-model="showCreate" title="Tambah item kulkas" width="440" @update:model-value="!$event && resetForm()">
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <v-text-field v-model="form.name" label="Nama item" placeholder="cth. Minuman Isotonik" />
        <v-text-field v-model.number="form.price" label="Harga (Rp)" type="number" placeholder="12000" />
        <v-text-field v-model.number="form.stock" label="Stok awal" type="number" placeholder="40" />
        <v-text-field v-model="form.unit" label="Satuan" placeholder="cth. botol, pcs" />
      </div>

      <template #actions>
        <ButtonBase variant="text" @click="showCreate = false">Batal</ButtonBase>
        <ButtonBase :loading="submitting" @click="submitProduct">Simpan</ButtonBase>
      </template>
    </DialogBase>
  </div>
</template>
