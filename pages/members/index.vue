<script setup lang="ts">
import type { TableHeader } from '~/components/base/TableBase.vue'
import { useApi } from '~/composables/useApi'
import { useNotif } from '~/composables/useNotif'
import { useAlert } from '~/composables/useAlert'

definePageMeta({ layout: 'default' })

interface Member {
  id: string
  name: string
  email: string
  phone: string
  packageName: string
  packageId?: string
  joinDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'frozen'
}
interface MembershipPackage {
  id: string
  name: string
  durationMonths: number
  price: number
}
interface Instructor {
  id: string
  name: string
  specialty: string
  pricePerSession: number
}

const api = useApi()
const notif = useNotif()
const alert = useAlert()

const headers: TableHeader[] = [
  { title: 'Nama', key: 'name' },
  { title: 'Kontak', key: 'email' },
  { title: 'Paket', key: 'packageName' },
  { title: 'Bergabung', key: 'joinDate' },
  { title: 'Berakhir', key: 'expiryDate' },
  { title: 'Status', key: 'status' },
  { title: '', key: 'actions', width: '56px', align: 'end' }
]

const items = ref<Member[]>([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const search = ref('')

async function load() {
  loading.value = true
  try {
    const res = await api.get<{ items: Member[]; total: number }>('/members', {
      query: { page: page.value, pageSize: 10, search: search.value }
    })
    items.value = res.items
    total.value = res.total
  } finally {
    loading.value = false
  }
}

let searchTimer: any = null
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; load() }, 350)
})
watch(page, load)

// --- data pendukung form: daftar paket (buat harga) & instruktur ---
const packages = ref<MembershipPackage[]>([])
const instructors = ref<Instructor[]>([])
async function loadFormData() {
  const [pkgRes, insRes] = await Promise.all([
    api.get<{ items: MembershipPackage[] }>('/memberships'),
    api.get<{ items: Instructor[] }>('/instructors')
  ])
  packages.value = pkgRes.items
  instructors.value = insRes.items
}

onMounted(() => {
  load()
  loadFormData()
})

const statusColor: Record<Member['status'], string> = {
  active: 'success',
  expired: 'error',
  frozen: 'warning'
}
const statusLabel: Record<Member['status'], string> = {
  active: 'Aktif',
  expired: 'Berakhir',
  frozen: 'Dibekukan'
}

// --- create/edit member dialog (dialog yang sama dipakai buat 2 mode) ---
const showCreate = ref(false)
const submitting = ref(false)
// null = mode tambah baru; diisi id member = mode edit.
const editingId = ref<string | null>(null)
const editingPackageName = ref('')
const dialogTitle = computed(() => editingId.value ? 'Edit member' : 'Tambah member baru')

const form = reactive({
  name: '',
  email: '',
  phone: '',
  packageId: '' as string,
  addInstructor: false,
  instructorId: '' as string,
  sessionCount: 4
})

const selectedPackage = computed(() => packages.value.find(p => p.id === form.packageId))
const selectedInstructor = computed(() => instructors.value.find(i => i.id === form.instructorId))
const addonTotal = computed(() => (
  form.addInstructor && selectedInstructor.value ? selectedInstructor.value.pricePerSession * form.sessionCount : 0
))
const grandTotal = computed(() => (selectedPackage.value?.price || 0) + addonTotal.value)

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function resetForm() {
  form.name = ''; form.email = ''; form.phone = ''
  form.packageId = ''; form.addInstructor = false; form.instructorId = ''; form.sessionCount = 4
  editingId.value = null
  editingPackageName.value = ''
}

function openCreateDialog() {
  resetForm()
  showCreate.value = true
}

/** Dipanggil dari @rowClick di TableBase — klik baris (bukan tombol aksi
 * di dalamnya) buka dialog yang sama dalam mode edit, terisi otomatis.
 * Paket & instruktur SENGAJA nggak diedit ulang di sini (itu transaksi
 * yang udah kejadian) — cuma data kontak member yang bisa diubah. */
function openEditDialog(member: Member) {
  editingId.value = member.id
  form.name = member.name
  form.email = member.email
  form.phone = member.phone
  editingPackageName.value = member.packageName
  showCreate.value = true
}

function closeDialog() {
  showCreate.value = false
  resetForm()
}

async function submitMember() {
  if (!form.name || !form.email) {
    notif.warning('Nama dan email wajib diisi')
    return
  }
  if (!editingId.value && !form.packageId) {
    notif.warning('Pilih paket membership dulu')
    return
  }
  if (!editingId.value && form.addInstructor && !form.instructorId) {
    notif.warning('Pilih instruktur atau matikan opsi tambahan instruktur')
    return
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await api.put(`/members/${editingId.value}`, { name: form.name, email: form.email, phone: form.phone })
      notif.success('Data member berhasil diperbarui')
    } else {
      await api.post('/members', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        packageId: form.packageId,
        instructorId: form.addInstructor ? form.instructorId : undefined,
        sessionCount: form.addInstructor ? form.sessionCount : undefined
      })
      notif.success(`Member baru ditambahkan — total tagihan ${formatCurrency(grandTotal.value)}`)
      page.value = 1
    }
    closeDialog()
    await load()
  } catch {
    notif.error(editingId.value ? 'Gagal memperbarui member' : 'Gagal menambahkan member')
  } finally {
    submitting.value = false
  }
}

async function confirmRemove(member: Member) {
  const ok = await alert.confirm(`Hapus ${member.name}?`, 'Data member ini akan dihapus permanen.')
  if (ok) notif.success('Member dihapus (dummy — belum tersambung ke API delete)')
}
</script>

<template>
  <div>
    <HeaderBase title="Members" subtitle="Kelola data member gym Anda.">
      <template #actions>
        <ButtonBase icon="mdi-plus" @click="openCreateDialog">Tambah member</ButtonBase>
      </template>
      <template #filters>
        <v-text-field v-model="search" placeholder="Cari nama atau email" style="max-width: 260px;">
          <template #prepend-inner><i class="mdi mdi-magnify" /></template>
        </v-text-field>
      </template>
    </HeaderBase>

    <div style="padding: 0 24px 24px;">
      <TableBase
        :headers="headers"
        :items="items"
        :loading="loading"
        :page="page"
        :total="total"
        @update:page="page = $event"
        @row-click="openEditDialog"
      >
        <template #item.email="{ item }">
          <div style="line-height: 1.5;">
            <div>{{ item.email }}</div>
            <div class="text-muted" style="font-size: 11px;">{{ item.phone }}</div>
          </div>
        </template>
        <template #item.status="{ value }">
          <v-chip size="small" :color="statusColor[value as Member['status']]" variant="flat">
            {{ statusLabel[value as Member['status']] }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <button class="row-action" @click="confirmRemove(item as Member)">
            <i class="mdi mdi-trash-can-outline" />
          </button>
        </template>
      </TableBase>
    </div>

    <DialogBase v-model="showCreate" :title="dialogTitle" width="480" @update:model-value="!$event && resetForm()">
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <v-text-field v-model="form.name" label="Nama lengkap" placeholder="cth. Andi Wijaya" />
        <v-text-field v-model="form.email" label="Email" placeholder="cth. andi@example.com" />
        <v-text-field v-model="form.phone" label="Nomor telepon" placeholder="cth. 0812-3456-7890" />

        <!-- Mode EDIT: paket cuma ditampilin read-only, nggak bisa diubah
             dari sini (itu bagian dari transaksi yang udah kejadian). -->
        <div v-if="editingId" class="members-readonly-package">
          <i class="mdi mdi-card-account-details-outline" />
          <span>Paket saat ini: <strong>{{ editingPackageName || '-' }}</strong></span>
        </div>

        <!-- Mode TAMBAH: pilih paket (harga kelihatan), plus opsi instruktur -->
        <template v-else>
          <v-select
            v-model="form.packageId"
            label="Paket membership"
            :items="packages.map(p => ({ title: `${p.name} - ${p.durationMonths} bulan (${formatCurrency(p.price)})`, value: p.id }))"
            placeholder="Pilih paket"
          />

          <v-switch
            v-model="form.addInstructor"
            label="Tambah instruktur gym (personal training)?"
            color="primary"
            density="compact"
            hide-details
            inset
          />

          <template v-if="form.addInstructor">
            <v-select
              v-model="form.instructorId"
              label="Pilih instruktur"
              :items="instructors.map(i => ({ title: `${i.name} — ${i.specialty} (${formatCurrency(i.pricePerSession)}/sesi)`, value: i.id }))"
              placeholder="Pilih instruktur"
            />
            <v-text-field
              v-model.number="form.sessionCount"
              label="Jumlah pertemuan"
              type="number"
              min="1"
              placeholder="4"
            />
          </template>

          <div v-if="form.packageId" class="members-total-box">
            <div class="members-total-box__row">
              <span>Paket ({{ selectedPackage?.name }})</span>
              <span>{{ formatCurrency(selectedPackage?.price || 0) }}</span>
            </div>
            <div v-if="form.addInstructor && selectedInstructor" class="members-total-box__row">
              <span>Instruktur ({{ form.sessionCount }}x sesi)</span>
              <span>{{ formatCurrency(addonTotal) }}</span>
            </div>
            <div class="members-total-box__row members-total-box__row--total">
              <span>Total</span>
              <strong>{{ formatCurrency(grandTotal) }}</strong>
            </div>
          </div>
        </template>
      </div>

      <template #actions>
        <ButtonBase variant="text" @click="closeDialog">Batal</ButtonBase>
        <ButtonBase :loading="submitting" @click="submitMember">
          {{ editingId ? 'Simpan' : `Simpan & Bayar ${formatCurrency(grandTotal)}` }}
        </ButtonBase>
      </template>
    </DialogBase>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.row-action {
  all: unset;
  cursor: pointer;
  color: $color-text-muted;
  display: inline-flex;
  padding: 4px;
  border-radius: $radius-sm;

  &:hover { color: $color-danger; background: rgba(242, 85, 90, 0.12); }
}

.members-readonly-package {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: $radius-sm;
  background: $color-bg-surface-2;
  font-size: 12.5px;
  color: $color-text-secondary;

  i { color: $color-primary; font-size: 16px; }
  strong { color: $color-text-primary; }
}

.members-total-box {
  border: 1px solid $color-border-strong;
  border-radius: $radius-sm;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__row {
    display: flex;
    justify-content: space-between;
    font-size: 12.5px;
    color: $color-text-secondary;

    &--total {
      border-top: 1px solid $color-border;
      padding-top: 6px;
      margin-top: 2px;
      font-size: 13px;
      color: $color-text-primary;

      strong { font-size: 16px; color: $color-primary; }
    }
  }
}
</style>
