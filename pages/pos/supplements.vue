<script setup lang="ts">
import type { TableHeader } from '~/components/base/TableBase.vue'
import { usePosProducts } from '~/composables/usePosProducts'
import { useNotif } from '~/composables/useNotif'

definePageMeta({ layout: 'default' })

const { items, loading, load, create } = usePosProducts('supplement')
const notif = useNotif()

onMounted(load)

const headers: TableHeader[] = [
  { title: 'Nama produk', key: 'name' },
  { title: 'Harga', key: 'price', align: 'end' },
  { title: 'Stok', key: 'stock', align: 'end' },
  { title: 'Satuan', key: 'unit' }
]

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

// --- tambah produk dialog ---
const showCreate = ref(false)
const form = reactive({ name: '', price: 0, stock: 0, unit: 'jar' })
const submitting = ref(false)

function resetForm() {
  form.name = ''; form.price = 0; form.stock = 0; form.unit = 'jar'
}

async function submitProduct() {
  if (!form.name || form.price <= 0) {
    notif.warning('Nama produk dan harga wajib diisi')
    return
  }
  submitting.value = true
  try {
    await create({ name: form.name, price: form.price, stock: form.stock, unit: form.unit })
    notif.success('Produk suplemen ditambahkan')
    showCreate.value = false
    resetForm()
  } catch {
    notif.error('Gagal menambahkan produk')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <HeaderBase title="Master Data Suplemen" subtitle="Kelola daftar produk suplemen beserta harga dan stok.">
      <template #actions>
        <ButtonBase icon="mdi-plus" @click="showCreate = true">Tambah produk</ButtonBase>
      </template>
    </HeaderBase>

    <div style="padding: 0 24px 24px;">
      <TableBase :headers="headers" :items="items" :loading="loading" :page="1" :total="items.length">
        <template #item.price="{ value }">{{ formatCurrency(value) }}</template>
        <template #item.stock="{ value }">
          <v-chip size="small" :color="value > 5 ? 'success' : value > 0 ? 'warning' : 'error'" variant="flat">
            {{ value }}
          </v-chip>
        </template>
      </TableBase>
    </div>

    <DialogBase v-model="showCreate" title="Tambah produk suplemen" width="440" @update:model-value="!$event && resetForm()">
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <v-text-field v-model="form.name" label="Nama produk" placeholder="cth. Whey Protein 1kg" />
        <v-text-field v-model.number="form.price" label="Harga (Rp)" type="number" placeholder="450000" />
        <v-text-field v-model.number="form.stock" label="Stok awal" type="number" placeholder="10" />
        <v-text-field v-model="form.unit" label="Satuan" placeholder="cth. jar, box, pcs" />
      </div>

      <template #actions>
        <ButtonBase variant="text" @click="showCreate = false">Batal</ButtonBase>
        <ButtonBase :loading="submitting" @click="submitProduct">Simpan</ButtonBase>
      </template>
    </DialogBase>
  </div>
</template>
