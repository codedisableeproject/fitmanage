<script setup lang="ts">
/**
 * Halaman ini adalah "redirect_uri" yang didaftarkan di Google Cloud
 * Console. Google akan redirect ke sini dengan ?code=... setelah user
 * approve login (atau ?error=... kalau user batal).
 */
import { useAuth } from '~/composables/useAuth'
import { useNotif } from '~/composables/useNotif'

definePageMeta({ layout: false })

const route = useRoute()
const { completeGoogleLogin } = useAuth()
const notif = useNotif()

const status = ref<'processing' | 'error'>('processing')
const errorMessage = ref('')

onMounted(async () => {
  const code = route.query.code as string | undefined
  const oauthError = route.query.error as string | undefined

  if (oauthError) {
    status.value = 'error'
    errorMessage.value = oauthError === 'access_denied'
      ? 'Login dibatalkan.'
      : `Login Google gagal: ${oauthError}`
    return
  }

  if (!code) {
    status.value = 'error'
    errorMessage.value = 'Kode otorisasi tidak ditemukan.'
    return
  }

  try {
    await completeGoogleLogin(code)
    notif.success('Login berhasil')
    await navigateTo('/')
  } catch (e: any) {
    status.value = 'error'
    errorMessage.value = e?.data?.statusMessage || e?.message || 'Login Google gagal.'
  }
})
</script>

<template>
  <div class="callback-page">
    <div class="callback-page__card">
      <template v-if="status === 'processing'">
        <v-progress-circular indeterminate color="primary" size="36" />
        <p class="callback-page__text">Memverifikasi login Google...</p>
      </template>

      <template v-else>
        <i class="mdi mdi-alert-circle-outline callback-page__error-icon" />
        <p class="callback-page__text">{{ errorMessage }}</p>
        <ButtonBase variant="outline" @click="navigateTo('/login')">Kembali ke login</ButtonBase>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-bg-page;

  &__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    text-align: center;
    max-width: 320px;
  }

  &__text { font-size: 13px; color: $color-text-secondary; margin: 0; }
  &__error-icon { font-size: 40px; color: $color-danger; }
}
</style>
