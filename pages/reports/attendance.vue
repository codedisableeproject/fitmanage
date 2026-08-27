<script setup lang="ts">
import type { TableHeader } from '~/components/base/TableBase.vue'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'default' })

interface ClassAttendance {
  id: string
  className: string
  day: string
  capacity: number
  booked: number
  attended: number
}

const api = useApi()
const loading = ref(true)
const items = ref<ClassAttendance[]>([])

onMounted(async () => {
  try {
    const res = await api.get<{ items: ClassAttendance[] }>('/reports/attendance')
    items.value = res.items
  } finally {
    loading.value = false
  }
})

const headers: TableHeader[] = [
  { title: 'Kelas', key: 'className' },
  { title: 'Hari', key: 'day' },
  { title: 'Kapasitas', key: 'capacity', align: 'end' },
  { title: 'Booking', key: 'booked', align: 'end' },
  { title: 'Hadir', key: 'attended', align: 'end' },
  { title: 'Tingkat kehadiran', key: 'rate' }
]

function rate(item: ClassAttendance) {
  return item.booked === 0 ? 0 : Math.round((item.attended / item.booked) * 100)
}
</script>

<template>
  <div>
    <HeaderBase title="Kehadiran kelas" subtitle="Tingkat kehadiran member pada tiap kelas." />

    <div style="padding: 0 24px 24px;">
      <TableBase :headers="headers" :items="items" :loading="loading" :page="1" :total="items.length">
        <template #item.rate="{ item }">
          <div class="attendance-rate">
            <div class="attendance-rate__bar">
              <div class="attendance-rate__fill" :style="{ width: rate(item as ClassAttendance) + '%' }" />
            </div>
            <span class="attendance-rate__label">{{ rate(item as ClassAttendance) }}%</span>
          </div>
        </template>
      </TableBase>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.attendance-rate {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;

  &__bar {
    flex: 1;
    height: 6px;
    border-radius: 4px;
    background: $color-bg-surface-2;
    overflow: hidden;
  }
  &__fill {
    height: 100%;
    background: $gradient-brand;
    border-radius: 4px;
  }
  &__label { font-size: 11px; color: $color-text-secondary; width: 32px; text-align: right; }
}
</style>
