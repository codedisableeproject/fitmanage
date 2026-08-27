import { reactive, computed, watch } from 'vue'
import { useRouter } from '#app'

export interface TabItem {
  key: string
  label: string
  to: string
  closable?: boolean
}

const STORAGE_KEY = 'fm_open_tabs'

// Label & key "resmi" untuk path yang dikenal — dipakai kalau perlu bikin
// tab otomatis (reload langsung di /members, atau tombol back/forward
// browser ke path yang belum ada tab-nya). Key ini SENGAJA disamakan
// dengan key di layouts/default.vue supaya highlight aktif di sidebar
// tetap nyambung dengan tab yang lagi aktif.
const ROUTE_REGISTRY: Record<string, { key: string; label: string }> = {
  '/': { key: 'dashboard', label: 'Dashboard' },
  '/members': { key: 'members', label: 'Members' },
  '/memberships': { key: 'memberships', label: 'Membership & paket' },
  '/transactions': { key: 'transactions', label: 'Transaksi & pembayaran' },
  '/schedule': { key: 'schedule', label: 'Jadwal kelas' },
  '/reports': { key: 'reports-overview', label: 'Ringkasan' },
  '/reports/revenue': { key: 'reports-revenue', label: 'Pendapatan' },
  '/reports/members': { key: 'reports-members', label: 'Member per paket' },
  '/reports/attendance': { key: 'reports-attendance', label: 'Kehadiran kelas' },
  '/pos/kasir': { key: 'pos-kasir', label: 'Kasir' },
  '/pos/supplements': { key: 'pos-supplements', label: 'Master Data Suplemen' },
  '/pos/fridge': { key: 'pos-fridge', label: 'Master Data Kulkas' },
  '/settings': { key: 'settings', label: 'Pengaturan Gym' }
}

function loadPersisted(): { tabs: TabItem[]; activeKey: string } | null {
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed?.tabs) && parsed.tabs.length && parsed.activeKey) return parsed
  } catch {
    // storage korup / tidak valid — abaikan, pakai default
  }
  return null
}

// State di luar function = singleton, dishare ke seluruh app tanpa Pinia.
// Di-restore dari sessionStorage kalau ada, supaya tab yang lagi kebuka
// TIDAK hilang / ketimpa saat halaman di-refresh (bug sebelumnya: refresh
// selalu balik ke [Dashboard] doang walau URL-nya /members).
const persisted = loadPersisted()
const state = reactive<{ tabs: TabItem[]; activeKey: string }>({
  tabs: persisted?.tabs ?? [{ key: 'dashboard', label: 'Dashboard', to: '/' }],
  activeKey: persisted?.activeKey ?? 'dashboard'
})

if (import.meta.client) {
  // state adalah reactive object -> watch otomatis deep-track tabs & activeKey.
  watch(state, () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs: state.tabs, activeKey: state.activeKey }))
    } catch {
      // ignore (mis. quota penuh)
    }
  }, { deep: true })
}

export function useTabs() {
  const router = useRouter()

  const tabs = computed(() => state.tabs)
  const activeKey = computed(() => state.activeKey)

  /** Dipanggil dari sidebar/menu ketika user klik sebuah menu item. */
  function openTab(tab: TabItem) {
    const existing = state.tabs.find(t => t.key === tab.key)
    if (!existing) {
      state.tabs.push({ closable: true, ...tab })
    }
    state.activeKey = tab.key
    router.push(tab.to)
  }

  function setActive(tab: TabItem) {
    state.activeKey = tab.key
    router.push(tab.to)
  }

  function closeTab(key: string) {
    const idx = state.tabs.findIndex(t => t.key === key)
    if (idx === -1) return
    const wasActive = state.activeKey === key
    state.tabs.splice(idx, 1)

    if (wasActive) {
      // pindah ke tab tetangga (kiri), fallback ke home
      const next = state.tabs[idx - 1] || state.tabs[0]
      if (next) {
        state.activeKey = next.key
        router.push(next.to)
      }
    }
  }

  /**
   * Samakan tab aktif dengan URL saat ini. Dipanggil dari layout setiap
   * kali path berubah (termasuk saat pertama kali load/refresh, dan
   * tombol back/forward browser). Kalau path itu belum punya tab, tab-nya
   * dibuat otomatis dari ROUTE_REGISTRY — TANPA router.push lagi, karena
   * kita memang sudah berada di path tersebut.
   */
  function syncWithRoute(path: string) {
    const existing = state.tabs.find(t => t.to === path)
    if (existing) {
      state.activeKey = existing.key
      return
    }

    const known = ROUTE_REGISTRY[path]
    const newTab: TabItem = known
      ? { key: known.key, label: known.label, to: path, closable: true }
      : { key: path, label: path, to: path, closable: true }

    state.tabs.push(newTab)
    state.activeKey = newTab.key
  }

  return { tabs, activeKey, openTab, setActive, closeTab, syncWithRoute }
}
