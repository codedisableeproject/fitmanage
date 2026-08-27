import { computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import type { UserRole } from '~/composables/useAuth'

/**
 * usePermissions
 * --------------
 * Peta menu apa aja yang boleh diakses tiap role. Dipakai di
 * layouts/default.vue buat filter sidebar, dan bisa juga dipakai di
 * halaman lain (mis. sembunyiin tombol "Tambah paket" buat operator).
 *
 * Desain akses (sesuai request — owner dapat semua, superuser & operator
 * "terserah", jadi saya desain masuk akal buat gym management):
 *  - OWNER: semua menu, termasuk Pengaturan Gym.
 *  - SUPERUSER: semua menu operasional + laporan, TANPA Pengaturan Gym
 *    (data gym cuma boleh diubah pemilik).
 *  - OPERATOR: kerjaan harian doang — Dashboard, Members, POS (Kasir +
 *    master data), Jadwal kelas. TANPA Laporan & Analitik, Membership &
 *    paket (harga paket sensitif), Transaksi & pembayaran (rekap
 *    keuangan), dan Pengaturan Gym.
 *
 * Key di sini HARUS sama persis dengan `key` menu di layouts/default.vue.
 */
const MENU_ACCESS: Record<UserRole, string[]> = {
  owner: [
    'dashboard', 'members', 'memberships', 'transactions', 'schedule',
    'reports-overview', 'reports-revenue', 'reports-members', 'reports-attendance',
    'pos-kasir', 'pos-supplements', 'pos-fridge',
    'settings'
  ],
  superuser: [
    'dashboard', 'members', 'memberships', 'transactions', 'schedule',
    'reports-overview', 'reports-revenue', 'reports-members', 'reports-attendance',
    'pos-kasir', 'pos-supplements', 'pos-fridge'
  ],
  operator: [
    'dashboard', 'members', 'schedule',
    'pos-kasir', 'pos-supplements', 'pos-fridge'
  ]
}

export function usePermissions() {
  const { user } = useAuth()

  const role = computed<UserRole>(() => (user.value?.role as UserRole) || 'operator')
  const allowedKeys = computed(() => MENU_ACCESS[role.value] || [])

  function canAccess(menuKey: string) {
    return allowedKeys.value.includes(menuKey)
  }

  return { role, allowedKeys, canAccess }
}
