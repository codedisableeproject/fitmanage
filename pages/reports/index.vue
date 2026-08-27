<script setup lang="ts">
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'default' })

interface Summary {
  totalMembers: number
  activeMembers: number
  revenueThisMonth: number
  upcomingClasses: number
}

const api = useApi()
const loading = ref(true)
const summary = ref<Summary>({ totalMembers: 0, activeMembers: 0, revenueThisMonth: 0, upcomingClasses: 0 })

onMounted(async () => {
  try {
    summary.value = await api.get<Summary>('/dashboard/summary')
  } finally {
    loading.value = false
  }
})

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

const links = [
  { to: '/reports/revenue', icon: 'mdi-trending-up', title: 'Pendapatan', desc: 'Tren pendapatan bulanan' },
  { to: '/reports/members', icon: 'mdi-chart-donut', title: 'Member per paket', desc: 'Distribusi member tiap paket' },
  { to: '/reports/attendance', icon: 'mdi-clipboard-check-outline', title: 'Kehadiran kelas', desc: 'Tingkat kehadiran tiap kelas' }
]
</script>

<template>
  <div>
    <HeaderBase title="Ringkasan laporan" subtitle="Pantau perkembangan bisnis fitness Anda secara umum." />

    <div v-if="loading" style="padding: 40px 24px; text-align: center;">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else style="padding: 0 24px 24px; display: flex; flex-direction: column; gap: 20px;">
      <div class="report-summary">
        <div class="report-summary__item">
          <div class="text-secondary-app" style="font-size: 12px;">Pendapatan bulan ini</div>
          <div class="report-summary__value">{{ formatCurrency(summary.revenueThisMonth) }}</div>
        </div>
        <div class="report-summary__item">
          <div class="text-secondary-app" style="font-size: 12px;">Total member</div>
          <div class="report-summary__value">{{ summary.totalMembers }}</div>
        </div>
        <div class="report-summary__item">
          <div class="text-secondary-app" style="font-size: 12px;">Member aktif</div>
          <div class="report-summary__value">{{ summary.activeMembers }}</div>
        </div>
      </div>

      <div>
        <div class="report-links__title">Lihat laporan lebih detail</div>
        <div class="report-links">
          <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="report-link-card">
            <div class="report-link-card__icon"><i class="mdi" :class="l.icon" /></div>
            <div>
              <div class="report-link-card__title">{{ l.title }}</div>
              <div class="report-link-card__desc">{{ l.desc }}</div>
            </div>
            <i class="mdi mdi-chevron-right report-link-card__chevron" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.report-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;

  &__item {
    background: $color-bg-surface;
    border: 1px solid $color-border-strong;
    border-radius: $radius-lg;
    padding: 18px 20px;
  }
  &__value { font-size: 20px; font-weight: 700; color: $color-text-primary; margin-top: 4px; }
}

.report-links__title {
  font-size: 13px;
  font-weight: 700;
  color: $color-text-primary;
  margin-bottom: 12px;
}

.report-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.report-link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: $color-bg-surface;
  border: 1px solid $color-border-strong;
  border-radius: $radius-lg;
  padding: 16px;
  text-decoration: none;
  transition: border-color .15s ease, background .15s ease;

  &:hover {
    border-color: $color-primary;
    background: $color-bg-surface-2;
  }

  &__icon {
    width: 38px; height: 38px; flex-shrink: 0;
    border-radius: $radius-md;
    background: rgba(124, 111, 234, 0.20);
    color: #C9C3FF;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }

  &__title { font-size: 13px; font-weight: 700; color: $color-text-primary; }
  &__desc { font-size: 11.5px; color: $color-text-muted; margin-top: 2px; }
  &__chevron { margin-left: auto; color: $color-text-muted; }
}
</style>
