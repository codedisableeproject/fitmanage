<script setup lang="ts">
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'default' })

interface MembershipPackage {
  id: string
  name: string
  durationMonths: number
  price: number
  benefits: string[]
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

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <div>
    <HeaderBase title="Membership & paket" subtitle="Kelola paket keanggotaan yang ditawarkan gym Anda.">
      <template #actions>
        <ButtonBase icon="mdi-plus">Tambah paket</ButtonBase>
      </template>
    </HeaderBase>

    <div v-if="loading" style="padding: 40px 24px; text-align: center;">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else class="package-grid">
      <div v-for="p in packages" :key="p.id" class="package-card">
        <div class="package-card__header">
          <div class="package-card__name">{{ p.name }}</div>
          <v-chip size="small" color="primary" variant="flat">{{ p.durationMonths }} bulan</v-chip>
        </div>
        <div class="package-card__price">{{ formatCurrency(p.price) }}</div>
        <ul class="package-card__benefits">
          <li v-for="b in p.benefits" :key="b"><i class="mdi mdi-check-circle-outline" />{{ b }}</li>
        </ul>
        <div class="package-card__footer">
          <span class="text-muted">{{ p.activeMembers }} member aktif</span>
          <ButtonBase variant="outline" size="small">Edit</ButtonBase>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  padding: 0 24px 24px;
}

.package-card {
  background: $color-bg-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  &__header { display: flex; align-items: center; justify-content: space-between; }
  &__name { font-size: 16px; font-weight: 700; color: $color-text-primary; }
  &__price { font-size: 24px; font-weight: 800; color: $color-primary; }

  &__benefits {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;

    li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: $color-text-secondary;

      i { color: $color-success; font-size: 16px; }
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid $color-border;
    font-size: 12px;
  }
}
</style>
