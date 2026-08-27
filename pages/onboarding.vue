<script setup lang="ts">
/**
 * Wizard onboarding — muncul otomatis (lewat middleware/auth.global.ts)
 * begitu owner login pertama kali (Google ATAU dev login) dan belum
 * pernah isi data gym. Simulasi "first run" karena kita belum punya
 * backend beneran buat deteksi "user baru" — status onboarded disimpan
 * di server/utils/dummyData.ts (gymProfile.isOnboarded) + cache di
 * cookie lewat composables/useGymProfile.ts.
 */
import { useAuth } from '~/composables/useAuth'
import { useGymProfile } from '~/composables/useGymProfile'
import { useNotif } from '~/composables/useNotif'

definePageMeta({ layout: false })

const { user, logout } = useAuth()
const { submitOnboarding } = useGymProfile()
const notif = useNotif()

function handleLogout() {
  logout()
}

const form = reactive({
  name: '',
  address: '',
  city: '',
  phone: '',
  openTime: '06:00',
  closeTime: '22:00',
  description: ''
})

const logoFiles = ref<File[]>([])
const submitting = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  errorMsg.value = ''
  if (!form.name || !form.address || !form.city || !form.phone) {
    errorMsg.value = 'Nama gym, alamat, kota, dan nomor telepon wajib diisi.'
    return
  }

  submitting.value = true
  try {
    await submitOnboarding(form)
    notif.success('Data gym berhasil disimpan')
    await navigateTo('/')
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || e?.message || 'Gagal menyimpan data gym.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="onboarding-page">
    <button type="button" class="onboarding-page__logout" @click="handleLogout">
      <i class="mdi mdi-logout" /> Keluar / ganti akun
    </button>

    <div class="onboarding-page__card">
      <div class="onboarding-page__header">
        <div class="onboarding-page__icon"><i class="mdi mdi-arm-flex-outline" /></div>
        <h1 class="onboarding-page__title">Selamat datang, {{ user?.name || 'Owner' }} 👋</h1>
        <p class="onboarding-page__subtitle">
          Sebelum masuk ke dashboard, lengkapi dulu data gym Anda. Ini cuma sekali di awal.
        </p>
      </div>

      <div class="onboarding-page__form">
        <div class="onboarding-page__row">
          <v-text-field v-model="form.name" label="Nama gym *" placeholder="cth. FitZone Sudirman" />
          <v-text-field v-model="form.phone" label="Nomor telepon *" placeholder="cth. 021-5550123" />
        </div>

        <v-text-field v-model="form.address" label="Alamat *" placeholder="cth. Jl. Sudirman No. 45" />

        <div class="onboarding-page__row">
          <v-text-field v-model="form.city" label="Kota *" placeholder="cth. Jakarta Selatan" />
          <div class="onboarding-page__row-inner">
            <v-text-field v-model="form.openTime" label="Jam buka" type="time" />
            <v-text-field v-model="form.closeTime" label="Jam tutup" type="time" />
          </div>
        </div>

        <v-textarea
          v-model="form.description"
          label="Deskripsi singkat (opsional)"
          placeholder="Ceritakan sedikit tentang gym Anda..."
          variant="outlined"
          rows="3"
          hide-details="auto"
        />

        <FormUploadBase
          v-model="logoFiles"
          label="Logo gym (opsional)"
          accept=".jpg,.jpeg,.png,.svg"
          hint="JPG, PNG, atau SVG — max 5MB"
          :max-size-mb="5"
        />

        <p v-if="errorMsg" class="onboarding-page__error">{{ errorMsg }}</p>

        <ButtonBase block :loading="submitting" @click="handleSubmit">
          Simpan &amp; Masuk ke Dashboard
        </ButtonBase>
      </div>
    </div>

    <NotifBase />
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.onboarding-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background:
    radial-gradient(circle at 15% 15%, rgba(124, 111, 234, 0.18), transparent 45%),
    radial-gradient(circle at 85% 75%, rgba(91, 141, 239, 0.14), transparent 50%),
    $color-bg-page;

  &__logout {
    all: unset;
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: $radius-sm;
    border: 1px solid $color-border-strong;
    background: $color-bg-surface;
    color: $color-text-secondary;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    z-index: 10;
    transition: color .15s ease, border-color .15s ease;

    i { font-size: 15px; }

    &:hover {
      color: $color-danger;
      border-color: $color-danger;
    }
  }

  &__card {
    width: 100%;
    max-width: 560px;
    background: $color-bg-surface;
    border: 1px solid $color-border-strong;
    border-radius: $radius-lg;
    padding: 36px;
  }

  &__header {
    text-align: center;
    margin-bottom: 28px;
  }

  &__icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 16px;
    border-radius: $radius-lg;
    background: $gradient-brand;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    color: #fff;
  }

  &__title {
    font-size: 20px;
    font-weight: 800;
    color: $color-text-primary;
    margin: 0 0 8px;
  }

  &__subtitle {
    font-size: 13px;
    color: $color-text-secondary;
    margin: 0;
    line-height: 1.6;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 520px) {
      grid-template-columns: 1fr;
    }
  }

  &__row-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  &__error {
    font-size: 12.5px;
    color: $color-danger;
    margin: -4px 0 0;
  }
}
</style>
