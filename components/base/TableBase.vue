<script setup lang="ts">
/**
 * TableBase
 * ---------
 * Tabel generik + pagination custom (gaya "‹ › [1] 0-0 of 0" seperti
 * referensi), bukan pagination bawaan Vuetify supaya bentuknya sama persis.
 *
 * headers: [{ title: 'Category', key: 'category', width?: '160px' }]
 * items:   array of objects, key harus cocok sama headers[].key
 *
 * Server-side pagination: dengar event @update:page, fetch data di parent,
 * lalu update prop items/total.
 *
 * rowClick: opsional. Kalau parent dengerin @rowClick, baris jadi
 * clickable (cursor pointer + hover state). Klik di dalam elemen
 * interaktif (button/a/input/dll, termasuk tombol aksi dari slot custom
 * seperti tombol hapus) TIDAK memicu rowClick — dicek lewat
 * `event.target.closest(...)`, jadi aman dipakai bareng slot #item.actions
 * tanpa perlu manual @click.stop di parent.
 */
import { useAttrs } from 'vue'

export interface TableHeader {
  title: string
  key: string
  width?: string
  align?: 'start' | 'center' | 'end'
}

const props = withDefaults(defineProps<{
  headers: TableHeader[]
  items: Record<string, any>[]
  loading?: boolean
  page: number
  pageSize?: number
  total: number
  emptyText?: string
}>(), {
  loading: false,
  pageSize: 10,
  emptyText: 'No data available'
})

const emit = defineEmits<{ 'update:page': [number]; rowClick: [Record<string, any>] }>()

// Vue nggak expose langsung "apakah ada listener buat event X", tapi
// listener @rowClick di parent otomatis nongol sebagai attrs.onRowClick —
// dipakai buat nentuin baris perlu di-styling clickable atau nggak.
const attrs = useAttrs()
const isRowClickable = computed(() => !!attrs.onRowClick)

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const rangeStart = computed(() => props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1)
const rangeEnd = computed(() => Math.min(props.page * props.pageSize, props.total))

function goPrev() {
  if (props.page > 1) emit('update:page', props.page - 1)
}
function goNext() {
  if (props.page < totalPages.value) emit('update:page', props.page + 1)
}
function goToPage(val: number) {
  const clamped = Math.min(Math.max(1, val || 1), totalPages.value)
  emit('update:page', clamped)
}

function onRowClick(row: Record<string, any>, event: MouseEvent) {
  if (!isRowClickable.value) return
  const target = event.target as HTMLElement
  // Klik di tombol/link/input di dalam row (mis. tombol hapus lewat slot
  // custom) sengaja diabaikan, supaya rowClick nggak ke-trigger bareng
  // aksi lain yang nggak nyambung (misal buka dialog edit PAS user
  // niatnya cuma mau hapus baris itu).
  if (target.closest('button, a, input, select, textarea, [data-stop-row-click]')) return
  emit('rowClick', row)
}
</script>

<template>
  <div class="table-base">
    <div class="table-base__toolbar">
      <div class="table-base__pagination">
        <ButtonBase
          variant="text"
          icon-only
          icon="mdi-chevron-left"
          size="small"
          aria-label="Halaman sebelumnya"
          :disabled="page <= 1"
          @click="goPrev"
        />
        <ButtonBase
          variant="text"
          icon-only
          icon="mdi-chevron-right"
          size="small"
          aria-label="Halaman berikutnya"
          :disabled="page >= totalPages"
          @click="goNext"
        />
        <input
          class="table-base__page-input"
          type="number"
          :value="page"
          min="1"
          :max="totalPages"
          @change="goToPage(Number(($event.target as HTMLInputElement).value))"
        >
        <span class="table-base__range">{{ rangeStart }} - {{ rangeEnd }} of {{ total }}</span>
      </div>
    </div>

    <div class="table-base__scroll">
      <table class="table-base__table">
        <thead>
          <tr>
            <th
              v-for="h in headers"
              :key="h.key"
              :style="{ width: h.width, textAlign: h.align || 'left' }"
            >
              {{ h.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="headers.length" class="table-base__state">
              <v-progress-circular indeterminate color="primary" size="24" />
            </td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td :colspan="headers.length" class="table-base__state text-muted">
              {{ emptyText }}
            </td>
          </tr>
          <tr
            v-else
            v-for="(row, i) in items"
            :key="row.id ?? i"
            :class="{ 'table-base__row--clickable': isRowClickable }"
            @click="onRowClick(row, $event)"
          >
            <td
              v-for="h in headers"
              :key="h.key"
              :style="{ textAlign: h.align || 'left' }"
            >
              <slot :name="`item.${h.key}`" :item="row" :value="row[h.key]">
                {{ row[h.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.table-base {
  background: $color-bg-surface;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  overflow: hidden;

  &__toolbar {
    display: flex;
    justify-content: flex-end;
    padding: 10px 16px;
    border-bottom: 1px solid $color-border;
  }

  &__pagination {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__page-input {
    width: 40px;
    height: 26px;
    text-align: center;
    border: 1px solid $color-border-strong;
    border-radius: $radius-sm;
    font-size: 12px;
    margin-left: 4px;
  }

  &__range {
    font-size: 12px;
    color: $color-text-secondary;
    white-space: nowrap;
    margin-left: 4px;
  }

  &__scroll {
    overflow-x: auto;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;

    th {
      background: $color-bg-page;
      color: $color-text-secondary;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 10px 16px;
      white-space: nowrap;
      border-bottom: 1px solid $color-border;
    }

    td {
      padding: 12px 16px;
      color: $color-text-primary;
      border-bottom: 1px solid $color-border;
    }

    tbody tr:hover td {
      background: $color-bg-page;
    }
  }

  &__row--clickable {
    cursor: pointer;
  }

  &__state {
    text-align: center !important;
    padding: 40px 16px !important;
  }
}
</style>
