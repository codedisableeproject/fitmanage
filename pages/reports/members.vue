<script setup lang="ts">
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'default' })

interface MembershipPackage {
  id: string
  name: string
  activeMembers: number
}

const api = useApi()
const loading = ref(true)
const packages = ref<MembershipPackage[]>([])

onMounted(async () => {
  try {
    const res = await api.get<{ items: MembershipPackage[] }>('/memberships')
    packages.value = res.items
  } finally {
    loading.value = false
  }
})

const total = computed(() => packages.value.reduce((s, p) => s + p.activeMembers, 0))
function pct(n: number) {
  return total.value === 0 ? 0 : Math.round((n / total.value) * 100)
}
</script>

<template>
  <div>
    <HeaderBase title="Member per paket" subtitle="Distribusi member aktif di tiap paket membership." />

    <div v-if="loading" style="padding: 40px 24px; text-align: center;">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else style="padding: 0 24px 24px;">
      <div class="app-surface members-breakdown">
        <div class="members-breakdown__title">Total {{ total }} member aktif</div>
        <div v-for="p in packages" :key="p.id" class="members-breakdown__row">
          <div class="members-breakdown__label">{{ p.name }}</div>
          <div class="members-breakdown__bar">
            <div class="members-breakdown__bar-fill" :style="{ width: pct(p.activeMembers) + '%' }" />
          </div>
          <div class="members-breakdown__pct">{{ p.activeMembers }} ({{ pct(p.activeMembers) }}%)</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.members-breakdown {
  padding: 20px;

  &__title { font-size: 14px; font-weight: 700; color: $color-text-primary; margin-bottom: 16px; }

  &__row {
    display: grid;
    grid-template-columns: 100px 1fr 110px;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  &__label { font-size: 12px; font-weight: 600; color: $color-text-secondary; }
  &__pct { font-size: 12px; color: $color-text-secondary; text-align: right; }

  &__bar {
    height: 8px;
    border-radius: 4px;
    background: $color-bg-surface-2;
    overflow: hidden;
  }
  &__bar-fill {
    height: 100%;
    background: $gradient-brand;
    border-radius: 4px;
  }
}
</style>
