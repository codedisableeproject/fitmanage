<script setup lang="ts">
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'default' })

interface RevenuePoint { month: string; amount: number }

const api = useApi()
const loading = ref(true)
const points = ref<RevenuePoint[]>([])

onMounted(async () => {
  try {
    const res = await api.get<{ items: RevenuePoint[] }>('/reports/revenue')
    points.value = res.items
  } finally {
    loading.value = false
  }
})

const maxAmount = computed(() => Math.max(...points.value.map(p => p.amount), 1))
const total = computed(() => points.value.reduce((s, p) => s + p.amount, 0))
const avg = computed(() => points.value.length ? total.value / points.value.length : 0)

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <div>
    <HeaderBase title="Pendapatan" subtitle="Tren pendapatan 6 bulan terakhir." />

    <div v-if="loading" style="padding: 40px 24px; text-align: center;">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else style="padding: 0 24px 24px; display: flex; flex-direction: column; gap: 16px;">
      <div class="revenue-summary">
        <div class="revenue-summary__item">
          <div class="text-secondary-app" style="font-size: 12px;">Total 6 bulan</div>
          <div class="revenue-summary__value">{{ formatCurrency(total) }}</div>
        </div>
        <div class="revenue-summary__item">
          <div class="text-secondary-app" style="font-size: 12px;">Rata-rata / bulan</div>
          <div class="revenue-summary__value">{{ formatCurrency(avg) }}</div>
        </div>
      </div>

      <div class="app-surface revenue-chart">
        <div v-for="p in points" :key="p.month" class="revenue-chart__col">
          <div class="revenue-chart__bar-wrap">
            <div class="revenue-chart__bar" :style="{ height: (p.amount / maxAmount * 100) + '%' }" />
          </div>
          <div class="revenue-chart__amount">{{ formatCurrency(p.amount) }}</div>
          <div class="revenue-chart__month text-muted">{{ p.month }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.revenue-summary {
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

.revenue-chart {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding: 24px 20px 16px;
  height: 260px;

  &__col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }

  &__bar-wrap {
    flex: 1;
    display: flex;
    align-items: flex-end;
    width: 100%;
  }

  &__bar {
    width: 100%;
    max-width: 36px;
    margin: 0 auto;
    border-radius: 6px 6px 0 0;
    background: $gradient-brand;
    min-height: 4px;
  }

  &__amount { font-size: 10.5px; color: $color-text-secondary; margin-top: 8px; white-space: nowrap; }
  &__month { font-size: 11px; margin-top: 2px; }
}
</style>
