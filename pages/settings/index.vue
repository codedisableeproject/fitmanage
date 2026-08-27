<script setup lang="ts">
import { useApi } from '~/composables/useApi'
import { useGymProfile } from '~/composables/useGymProfile'
import { useNotif } from '~/composables/useNotif'

definePageMeta({ layout: 'default' })

interface GymProfileData {
  name: string
  address: string
  city: string
  phone: string
  openTime: string
  closeTime: string
  description: string
}

const api = useApi()
const { submitOnboarding } = useGymProfile()
const notif = useNotif()

const loading = ref(true)
const saving = ref(false)
const form = reactive<GymProfileData>({
  name: '', address: '', city: '', phone: '', openTime: '06:00', closeTime: '22:00', description: ''
})

onMounted(async () => {
  try {
    const profile = await api.get<GymProfileData>('/gym-profile')
    Object.assign(form, profile)
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  if (!form.name || !form.address || !form.city || !form.phone) {
    notif.warning('Nama gym, alamat, kota, dan nomor telepon wajib diisi')
    return
  }
  saving.value = true
  try {
    await submitOnboarding(form)
    notif.success('Data gym berhasil diperbarui')
  } catch {
    notif.error('Gagal menyimpan perubahan')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <HeaderBase title="Pengaturan Gym" subtitle="Data ini yang dipakai di seluruh aplikasi & dilihat member." />

    <div v-if="loading" style="padding: 40px 24px; text-align: center;">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else style="padding: 0 24px 24px; max-width: 640px;">
      <div class="app-surface" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <v-text-field v-model="form.name" label="Nama gym" />
          <v-text-field v-model="form.phone" label="Nomor telepon" />
        </div>

        <v-text-field v-model="form.address" label="Alamat" />

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
          <v-text-field v-model="form.city" label="Kota" />
          <v-text-field v-model="form.openTime" label="Jam buka" type="time" />
          <v-text-field v-model="form.closeTime" label="Jam tutup" type="time" />
        </div>

        <v-textarea
          v-model="form.description"
          label="Deskripsi singkat"
          variant="outlined"
          rows="3"
          hide-details="auto"
        />

        <div>
          <ButtonBase :loading="saving" @click="handleSave">Simpan perubahan</ButtonBase>
        </div>
      </div>
    </div>
  </div>
</template>
