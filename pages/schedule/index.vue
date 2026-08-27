<script setup lang="ts">
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'default' })

interface ScheduleClass {
  id: string
  className: string
  coach: string
  day: string
  time: string
  capacity: number
  booked: number
}

const api = useApi()
const loading = ref(true)
const classes = ref<ScheduleClass[]>([])

onMounted(async () => {
  try {
    const res = await api.get<{ items: ScheduleClass[] }>('/schedule')
    classes.value = res.items
  } finally {
    loading.value = false
  }
})

function fillRatio(c: ScheduleClass) {
  return Math.round((c.booked / c.capacity) * 100)
}
</script>

<template>
  <div>
    <HeaderBase title="Jadwal kelas" subtitle="Jadwal kelas dan kapasitas peserta minggu ini.">
      <template #actions>
        <ButtonBase icon="mdi-plus">Tambah kelas</ButtonBase>
      </template>
    </HeaderBase>

    <div v-if="loading" style="padding: 40px 24px; text-align: center;">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else class="schedule-list">
      <div v-for="c in classes" :key="c.id" class="schedule-row app-surface">
        <div class="schedule-row__day">
          <div class="schedule-row__day-label">{{ c.day }}</div>
          <div class="schedule-row__time">{{ c.time }}</div>
        </div>

        <div class="schedule-row__info">
          <div class="schedule-row__title">{{ c.className }}</div>
          <div class="text-muted" style="font-size: 12px;">Coach: {{ c.coach }}</div>
        </div>

        <div class="schedule-row__capacity">
          <div class="schedule-row__capacity-label">{{ c.booked }}/{{ c.capacity }} peserta</div>
          <div class="schedule-row__bar">
            <div class="schedule-row__bar-fill" :style="{ width: fillRatio(c) + '%' }" :class="{ 'schedule-row__bar-fill--full': fillRatio(c) >= 100 }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 24px 24px;
}

.schedule-row {
  display: grid;
  grid-template-columns: 120px 1fr 200px;
  align-items: center;
  gap: 20px;
  padding: 14px 18px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  &__day-label { font-size: 13px; font-weight: 700; color: $color-text-primary; }
  &__time { font-size: 11px; color: $color-text-muted; }

  &__title { font-size: 14px; font-weight: 600; color: $color-text-primary; }

  &__capacity-label { font-size: 11px; color: $color-text-secondary; margin-bottom: 6px; text-align: right; }

  &__bar {
    height: 6px;
    border-radius: 4px;
    background: $color-bg-surface-2;
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    background: $gradient-brand;
    border-radius: 4px;

    &--full { background: $color-warning; }
  }
}
</style>
