<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useNotif } from '~/composables/useNotif'
import type { UserRole } from '~/composables/useAuth'

definePageMeta({ layout: false })

const { redirectToGoogle, loginAsDev, allowDevLogin } = useAuth()
const notif = useNotif()
const loadingGoogle = ref(false)
const loadingDevRole = ref<UserRole | null>(null)

const features = [
  { icon: 'mdi-account-group-outline', title: 'Manajemen member', desc: 'Kelola data member dengan mudah' },
  { icon: 'mdi-card-account-details-outline', title: 'Membership & paket', desc: 'Atur paket, perpanjangan & masa aktif' },
  { icon: 'mdi-currency-usd', title: 'Transaksi & pembayaran', desc: 'Catat semua transaksi secara real-time' },
  { icon: 'mdi-chart-bar', title: 'Laporan & analitik', desc: 'Pantau perkembangan bisnis Anda' }
]

const devRoles: { role: UserRole; label: string; desc: string; icon: string }[] = [
  { role: 'owner', label: 'Owner', desc: 'Akses semua menu + pengaturan gym', icon: 'mdi-crown-outline' },
  { role: 'superuser', label: 'Super User', desc: 'Operasional penuh + laporan', icon: 'mdi-shield-account-outline' },
  { role: 'operator', label: 'Operator', desc: 'Kasir, member, jadwal harian', icon: 'mdi-account-cog-outline' }
]

function handleGoogleLogin() {
  loadingGoogle.value = true
  try {
    // Ini benar-benar melempar browser ke accounts.google.com (redirect
    // penuh, bukan popup/dummy) — kalau berhasil, tab ini akan pindah
    // halaman, jadi loadingGoogle sengaja tidak di-reset di sini.
    redirectToGoogle()
  } catch (e: any) {
    notif.error(e.message || 'Login Google gagal')
    loadingGoogle.value = false
  }
}

async function handleDevLogin(role: UserRole) {
  loadingDevRole.value = role
  try {
    const user = await loginAsDev(role)
    notif.success(`Masuk sebagai ${user.name} (dev)`)
    await navigateTo('/')
  } catch (e: any) {
    notif.error(e.message || 'Dev login gagal')
  } finally {
    loadingDevRole.value = null
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-page__hero">
      <div class="login-page__hero-overlay" />
      <div class="login-page__hero-content">
        <div class="login-page__brand">
          <div class="login-page__brand-mark">
            <i class="mdi mdi-arm-flex-outline" />
          </div>
          <div>
            <div class="login-page__brand-name">
              FIT<span class="login-page__brand-name--accent">MANAGE</span>
            </div>
            <div class="login-page__brand-tagline">Management fitness</div>
          </div>
        </div>

        <h1 class="login-page__headline">
          Kelola bisnis fitness<br>
          <span class="login-page__headline--accent">lebih mudah &amp; efisien</span>
        </h1>
        <div class="login-page__rule" />
        <p class="login-page__lead">
          Solusi lengkap untuk manajemen member, transaksi, jadwal, laporan dan banyak lagi.
        </p>

        <ul class="login-page__feature-list">
          <li v-for="f in features" :key="f.title" class="login-page__feature">
            <span class="login-page__feature-icon"><i class="mdi" :class="f.icon" /></span>
            <span>
              <strong>{{ f.title }}</strong>
              <small>{{ f.desc }}</small>
            </span>
          </li>
        </ul>
      </div>
      <div class="login-page__footer">© 2026 FitManage. All rights reserved.</div>
    </div>

    <div class="login-page__panel">
      <div class="login-page__card">
        <div class="login-page__card-icon"><i class="mdi mdi-arm-flex-outline" /></div>
        <h2 class="login-page__welcome">Welcome back!</h2>
        <p class="login-page__welcome-sub">Sign in to access your fitness management dashboard</p>
        <div class="login-page__rule login-page__rule--center" />

        <button class="login-page__google-btn" :disabled="loadingGoogle" @click="handleGoogleLogin">
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.8-.4-4.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 15.6 3 8.4 7.8 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.3 36.6 26.8 37.5 24 37.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C8.3 40 15.6 45 24 45z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C40.5 36.5 43 30.9 43 24c0-1.4-.1-2.8-.4-4.5z"/>
          </svg>
          <span v-if="!loadingGoogle">Continue with Google</span>
          <span v-else>Mengalihkan ke Google...</span>
        </button>

        <p class="login-page__secure"><i class="mdi mdi-lock-outline" /> Aman, cepat, dan hanya dengan akun Google Anda.</p>

        <template v-if="allowDevLogin">
          <div class="login-page__divider"><span>atau pilih role (dev)</span></div>
          <div class="login-page__dev-roles">
            <button
              v-for="dr in devRoles"
              :key="dr.role"
              type="button"
              class="login-page__dev-btn"
              :disabled="loadingDevRole !== null"
              @click="handleDevLogin(dr.role)"
            >
              <i class="mdi" :class="loadingDevRole === dr.role ? 'mdi-loading mdi-spin' : dr.icon" />
              <span class="login-page__dev-btn-text">
                <strong>{{ dr.label }}</strong>
                <small>{{ dr.desc }}</small>
              </span>
            </button>
          </div>
          <p class="login-page__dev-hint">Khusus development — tidak tampil di production.</p>
        </template>

        <div class="login-page__card-footer-rule" />
        <p class="login-page__data-safe"><i class="mdi mdi-shield-check-outline" /> Data Anda aman bersama kami</p>
      </div>
    </div>

    <NotifBase />
    <DialogAlertBase />
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  background: $color-bg-page;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  &__hero {
    position: relative;
    padding: 48px 56px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    background:
      radial-gradient(circle at 15% 15%, rgba(124, 111, 234, 0.25), transparent 45%),
      radial-gradient(circle at 85% 75%, rgba(91, 141, 239, 0.18), transparent 50%),
      linear-gradient(180deg, #08080F 0%, #0F0F1C 100%);

    @media (max-width: 900px) { display: none; }
  }

  &__hero-overlay {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(120deg, transparent 40%, rgba(124, 111, 234, 0.06) 41%, transparent 43%),
      linear-gradient(120deg, transparent 60%, rgba(124, 111, 234, 0.05) 61%, transparent 63%);
    pointer-events: none;
  }

  &__hero-content { position: relative; z-index: 1; max-width: 480px; }

  &__brand { display: flex; align-items: center; gap: 12px; margin-bottom: 56px; }

  &__brand-mark {
    width: 44px; height: 44px;
    border-radius: $radius-md;
    background: $gradient-brand;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; color: #fff;
  }

  &__brand-name {
    font-size: 20px; font-weight: 800; letter-spacing: 0.02em; color: $color-text-primary;
    &--accent { color: $color-primary; }
  }
  &__brand-tagline { font-size: 10px; letter-spacing: 0.18em; color: $color-text-muted; }

  &__headline {
    font-size: 34px; font-weight: 800; line-height: 1.25; margin: 0 0 20px;
    color: $color-text-primary;
    &--accent { color: $color-primary; }
  }

  &__rule {
    width: 48px; height: 3px; border-radius: 2px;
    background: $gradient-brand;
    margin-bottom: 20px;

    &--center { margin: 20px auto 24px; }
  }

  &__lead { font-size: 14px; color: $color-text-secondary; line-height: 1.7; margin: 0 0 32px; max-width: 380px; }

  &__feature-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 18px; }

  &__feature {
    display: flex; align-items: center; gap: 14px;

    strong { display: block; font-size: 14px; font-weight: 700; color: $color-text-primary; }
    small { display: block; font-size: 12px; color: $color-text-muted; margin-top: 2px; }
  }

  &__feature-icon {
    width: 40px; height: 40px; flex-shrink: 0;
    border-radius: $radius-md;
    background: rgba(124, 111, 234, 0.16);
    color: $color-primary;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }

  &__footer { position: relative; z-index: 1; font-size: 11px; color: $color-text-muted; }

  &__panel {
    display: flex; align-items: center; justify-content: center;
    padding: 40px 24px;
  }

  &__card {
    width: 100%; max-width: 400px;
    background: $color-bg-surface;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    padding: 40px 32px 32px;
    text-align: center;
  }

  &__card-icon {
    width: 64px; height: 64px; margin: 0 auto 20px;
    border-radius: $radius-lg;
    background: $gradient-brand;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; color: #fff;
  }

  &__welcome { font-size: 22px; font-weight: 800; color: $color-text-primary; margin: 0 0 8px; }
  &__welcome-sub { font-size: 13px; color: $color-text-secondary; margin: 0; }

  &__google-btn {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    background: #fff;
    color: #1F1F1F;
    font-size: 14px; font-weight: 600;
    padding: 12px 16px;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: opacity .15s ease;

    &:hover { opacity: 0.92; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }

  &__secure {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    font-size: 11px; color: $color-text-muted;
    margin: 14px 0 0;
  }

  &__divider {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 18px 0;
    font-size: 11px;
    color: $color-text-muted;

    &::before, &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: $color-border;
    }
  }

  &__dev-roles {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__dev-btn {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    display: flex; align-items: center; gap: 10px;
    background: rgba(124, 111, 234, 0.10);
    border: 1px dashed $color-primary;
    color: $color-text-primary;
    padding: 10px 14px;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: background .15s ease;
    text-align: left;

    i { color: $color-primary; font-size: 20px; flex-shrink: 0; }
    &:hover { background: rgba(124, 111, 234, 0.2); }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }

  &__dev-btn-text {
    display: flex;
    flex-direction: column;
    gap: 1px;

    strong { font-size: 13px; font-weight: 700; }
    small { font-size: 11px; color: $color-text-muted; }
  }

  &__dev-hint {
    font-size: 10.5px;
    color: $color-text-muted;
    margin: 8px 0 0;
  }

  &__card-footer-rule { border-top: 1px solid $color-border; margin: 24px 0 16px; }

  &__data-safe {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    font-size: 12px; color: $color-text-secondary; margin: 0;
  }
}
</style>
