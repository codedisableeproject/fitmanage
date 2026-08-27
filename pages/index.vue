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

const cards = computed(() => [
  { label: 'Total member', value: summary.value.totalMembers, icon: 'mdi-account-group-outline' },
  { label: 'Member aktif', value: summary.value.activeMembers, icon: 'mdi-account-check-outline' },
  { label: 'Pendapatan bulan ini', value: formatCurrency(summary.value.revenueThisMonth), icon: 'mdi-currency-usd' },
  { label: 'Kelas mendatang', value: summary.value.upcomingClasses, icon: 'mdi-calendar-clock-outline' }
])

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <div>
    <HeaderBase title="Dashboard" subtitle="Ringkasan bisnis fitness Anda hari ini." />

    <div class="dashboard-grid">
      <div v-for="c in cards" :key="c.label" class="dashboard-card">
        <div class="dashboard-card__icon"><i class="mdi" :class="c.icon" /></div>
        <div>
          <div class="dashboard-card__label">{{ c.label }}</div>
          <div class="dashboard-card__value">
            <v-progress-circular v-if="loading" indeterminate size="18" width="2" color="primary" />
            <template v-else>{{ c.value }}</template>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-hint app-surface">
      <i class="mdi mdi-information-outline" />
      <span>Data di atas masih dummy (dari <code>server/api/dashboard/summary.get.ts</code>). Sambungkan ke backend asli lewat env <code>BACKEND_BASE_URL</code> — kode halaman tidak perlu diubah.</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  padding: 0 24px 24px;
}

.dashboard-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: $color-bg-surface;
  border: 1px solid $color-border-strong;
  border-radius: $radius-lg;
  padding: 18px 20px;

  &__icon {
    width: 44px; height: 44px; flex-shrink: 0;
    border-radius: $radius-md;
    background: rgba(124, 111, 234, 0.20);
    color: #C9C3FF;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }

  &__label { font-size: 12px; font-weight: 600; color: $color-text-secondary; margin-bottom: 4px; }
  &__value { font-size: 22px; font-weight: 700; color: $color-text-primary; }
}

.dashboard-hint {
  margin: 0 24px 24px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  font-size: 12px;
  color: $color-text-secondary;
  line-height: 1.6;
  border-color: rgba(124, 111, 234, 0.35) !important;
  background: rgba(124, 111, 234, 0.08) !important;

  i { color: $color-primary; font-size: 18px; margin-top: 1px; flex-shrink: 0; }
  code {
    background: $color-bg-surface-2;
    color: $color-text-primary;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 11px;
  }
}
</style>
