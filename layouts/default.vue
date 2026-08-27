<script setup lang="ts">
import { useTabs } from '~/composables/useTabs'
import { useAuth } from '~/composables/useAuth'
import { useAppTheme } from '~/composables/useAppTheme'
import { useSidebarRail } from '~/composables/useSidebarRail'
import { usePermissions } from '~/composables/usePermissions'
import { useHoverCapable } from '~/composables/useHoverCapable'

const { supportsHover } = useHoverCapable()

const { openTab, activeKey, syncWithRoute } = useTabs()
const { user, logout } = useAuth()
const { railMode, toggle: toggleRail } = useSidebarRail()
const { canAccess } = usePermissions()

// ssr:false, jadi aman panggil langsung di setup — apply tema tersimpan
// (cookie) sebelum layout pertama kali dirender, biar nggak ada "flash".
useAppTheme().initTheme()

// Samakan tab aktif dengan URL beneran — sekali saat pertama layout
// dirender (termasuk pas refresh) dan setiap kali path berubah lewat cara
// APAPUN (klik menu, tombol back/forward browser, ketik URL manual).
// Ini yang memperbaiki bug "refresh bikin tab balik ke Dashboard doang
// padahal isinya halaman lain".
const route = useRoute()
syncWithRoute(route.path)
watch(() => route.path, (path) => syncWithRoute(path))

interface MenuChild { key: string; label: string; to: string }
interface MenuItem { key: string; label: string; icon: string; to?: string; closable?: boolean; children?: MenuChild[] }

// Data menu — key HARUS sama persis dengan yang didaftarkan di
// composables/usePermissions.ts, karena itu yang menentukan visible/
// nggaknya per role (lihat `visibleMenus` di bawah).
const menus: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/' },
  { key: 'members', label: 'Members', icon: 'mdi-account-group-outline', to: '/members' },
  { key: 'memberships', label: 'Membership & paket', icon: 'mdi-card-account-details-outline', to: '/memberships' },
  { key: 'transactions', label: 'Transaksi & pembayaran', icon: 'mdi-currency-usd', to: '/transactions' },
  { key: 'schedule', label: 'Jadwal kelas', icon: 'mdi-calendar-blank-outline', to: '/schedule' },
  {
    key: 'reports',
    label: 'Laporan & analitik',
    icon: 'mdi-chart-bar',
    children: [
      { key: 'reports-overview', label: 'Ringkasan', to: '/reports' },
      { key: 'reports-revenue', label: 'Pendapatan', to: '/reports/revenue' },
      { key: 'reports-members', label: 'Member per paket', to: '/reports/members' },
      { key: 'reports-attendance', label: 'Kehadiran kelas', to: '/reports/attendance' }
    ]
  },
  {
    key: 'pos',
    label: 'POS',
    icon: 'mdi-point-of-sale',
    children: [
      { key: 'pos-kasir', label: 'Kasir', to: '/pos/kasir' },
      { key: 'pos-supplements', label: 'Master Data Suplemen', to: '/pos/supplements' },
      { key: 'pos-fridge', label: 'Master Data Kulkas', to: '/pos/fridge' }
    ]
  },
  { key: 'settings', label: 'Pengaturan Gym', icon: 'mdi-cog-outline', to: '/settings' }
]

// Filter menu sesuai role: item single disaring lewat canAccess(key),
// group disaring per-child lalu grupnya disembunyikan total kalau nggak
// ada satu pun child yang boleh diakses (mis. operator nggak lihat menu
// "Laporan & analitik" sama sekali).
const visibleMenus = computed<MenuItem[]>(() => {
  return menus
    .map(item => {
      if (!item.children) return item
      return { ...item, children: item.children.filter(c => canAccess(c.key)) }
    })
    .filter(item => item.children ? item.children.length > 0 : canAccess(item.key))
})

function selectMenu(item: { key: string; label: string; to: string; closable?: boolean }) {
  openTab(item)
}

function initials(name?: string | null) {
  if (!name) return 'FM'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  superuser: 'Super User',
  operator: 'Operator'
}
const roleLabel = computed(() => ROLE_LABELS[user.value?.role || ''] || user.value?.role || '')
</script>

<template>
  <v-app>
    <v-navigation-drawer
      :rail="railMode"
      rail-width="72"
      width="248"
      permanent
      class="sidebar"
      :class="{ 'sidebar--rail': railMode, 'sidebar--hover-capable': supportsHover }"
    >
      <div class="sidebar__brand">
        <div class="sidebar__brand-mark"><i class="mdi mdi-arm-flex-outline" /></div>
        <div v-if="!railMode">
          <div class="sidebar__brand-name">FIT<span>MANAGE</span></div>
          <div class="sidebar__brand-tagline">Management fitness</div>
        </div>
      </div>

      <v-list nav density="compact" class="sidebar__list">
        <template v-for="item in visibleMenus" :key="item.key">
          <!-- Item biasa (nggak punya submenu): dibungkus v-menu juga,
               tapi CUMA aktif waktu rail mode (disabled="!railMode" ->
               false berarti aktif) DAN cuma di device yang beneran punya
               hover (supportsHover, lihat composables/useHoverCapable.ts)
               — di HP/touch, tap = langsung navigasi lewat @click di
               bawah, nggak perlu preview tooltip (dan kalau dipaksa nyala
               di touch, tooltip-nya bakal nyangkut nggak pernah nutup
               sendiri karena nggak ada event "hover keluar" beneran). -->
          <v-menu
            v-if="!item.children"
            :disabled="!railMode"
            :open-on-hover="supportsHover"
            :open-on-click="false"
            location="end"
            offset="10"
            open-delay="120"
            close-delay="80"
          >
            <template #activator="{ props: activatorProps }">
              <v-list-item
                v-bind="activatorProps"
                :active="activeKey === item.key"
                class="sidebar__item"
                @click="selectMenu(item as any)"
              >
                <template #prepend>
                  <span class="sidebar__icon"><i class="mdi" :class="item.icon" /></span>
                </template>
                <v-list-item-title v-if="!railMode" class="sidebar__item-label">{{ item.label }}</v-list-item-title>
              </v-list-item>
            </template>

            <div class="sidebar__tooltip">{{ item.label }}</div>
          </v-menu>

          <!-- Group (punya submenu): flyout ke kanan (klik) + tooltip
               label pas hover (rail mode doang, sama kayak item biasa).
               2 mekanisme ini SENGAJA dipisah jadi 2 komponen berbeda
               (v-tooltip buat hover-preview, v-menu buat klik-buka-flyout)
               yang di-nesting di activator yang sama — props dari
               keduanya digabung (v-bind spread) ke satu v-list-item yang
               sama, jadi hover & klik jalan independen tanpa saling
               ganggu. Keduanya render lewat overlay yang di-teleport ke
               root (bukan CSS position:absolute biasa), jadi kebal dari
               overflow/clipping punya drawer Vuetify.
               Parent item SENGAJA nggak punya @click navigasi sendiri
               (dulu ada bug: klik parent langsung buka child pertama,
               padahal parent cuma "wadah" doang) — klik/tap parent CUMA
               buka flyout-nya (open-on-click default true dari v-menu),
               user HARUS pilih salah satu child buat navigasi. Flyout
               SENGAJA nggak buka pas hover doang — harus di-klik dulu
               (open-on-hover dimatikan total), biar nggak numpuk kebuka
               sendiri pas cursor cuma lewat. -->
          <v-menu
            v-else
            :open-on-hover="false"
            location="end"
            offset="14"
          >
            <template #activator="{ props: menuActivatorProps }">
              <v-tooltip
                :disabled="!railMode || !supportsHover"
                location="end"
                offset="10"
                open-delay="120"
                close-delay="80"
                content-class="sidebar__tooltip"
              >
                <template #activator="{ props: tooltipActivatorProps }">
                  <v-list-item
                    v-bind="{ ...menuActivatorProps, ...tooltipActivatorProps }"
                    :active="item.children?.some(c => c.key === activeKey) ?? false"
                    class="sidebar__item"
                  >
                    <template #prepend>
                      <span class="sidebar__icon">
                        <i class="mdi" :class="item.icon" />
                      </span>
                    </template>
                    <v-list-item-title v-if="!railMode" class="sidebar__item-label">{{ item.label }}</v-list-item-title>
                    <template v-if="!railMode" #append>
                      <i class="mdi mdi-chevron-right sidebar__chevron" />
                    </template>
                  </v-list-item>
                </template>
                {{ item.label }}
              </v-tooltip>
            </template>

            <div class="sidebar__flyout">
              <div class="sidebar__flyout-title">{{ item.label }}</div>
              <button
                v-for="child in item.children"
                :key="child.key"
                type="button"
                class="sidebar__flyout-item"
                :class="{ 'sidebar__flyout-item--active': activeKey === child.key }"
                @click="selectMenu(child)"
              >
                {{ child.label }}
              </button>
            </div>
          </v-menu>
        </template>
      </v-list>

      <template #append>
        <div class="sidebar__theme">
          <ThemeSwitcherBase :compact="railMode" />
        </div>
        <div class="sidebar__user">
          <div class="sidebar__user-avatar">{{ initials(user?.name) }}</div>
          <div v-if="!railMode" class="sidebar__user-info">
            <div class="sidebar__user-name">{{ user?.name || 'Admin' }}</div>
            <div class="sidebar__user-email">{{ user?.email || '-' }}</div>
            <span class="sidebar__user-role">{{ roleLabel }}</span>
          </div>
          <button class="sidebar__logout-btn" aria-label="Logout" @click="logout">
            <i class="mdi mdi-logout" />
          </button>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Tombol toggle collapse/expand — nempel di border kanan sidebar,
         posisinya ikut geser sesuai lebar sidebar (248px penuh / 72px rail). -->
    <button
      type="button"
      class="sidebar-toggle"
      :class="{ 'sidebar-toggle--rail': railMode }"
      :style="{ left: (railMode ? 72 : 248) + 'px' }"
      :aria-label="railMode ? 'Buka sidebar' : 'Tutup sidebar'"
      @click="toggleRail"
    >
      <i class="mdi" :class="railMode ? 'mdi-chevron-right' : 'mdi-chevron-left'" />
    </button>

    <v-main class="main">
      <TabBase />
      <div class="main__content">
        <slot />
      </div>
    </v-main>

    <DialogAlertBase />
    <NotifBase />
  </v-app>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.sidebar {
  border-right: 1px solid $color-border !important;
  background: $color-bg-surface !important;
  transition: width .2s ease;

  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px 16px;
  }

  &--rail &__brand {
    justify-content: center;
    padding: 18px 8px;
  }

  &__brand-mark {
    width: 34px; height: 34px;
    border-radius: $radius-sm;
    background: $gradient-brand;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 16px;
    flex-shrink: 0;
  }

  &__brand-name {
    font-size: 14px; font-weight: 800; color: $color-text-primary;
    span { color: $color-primary; }
  }
  &__brand-tagline { font-size: 9px; letter-spacing: 0.14em; color: $color-text-muted; }

  &__list { padding: 4px 8px; }

  &--rail &__list { padding: 4px 8px; }

  &--rail &__item {
    justify-content: center;
  }

  &--rail &__icon { margin-right: 0; }

  &__item {
    border-radius: $radius-sm;
    margin-bottom: 2px;
    min-height: 40px;
  }

  // Kotak icon seragam (24x24) supaya semua icon sejajar rapi terlepas
  // dari bentuk/lebar bawaan tiap glyph mdi. margin-right kasih jarak ke
  // label supaya nggak mepet.
  &__icon {
    width: 24px;
    height: 24px;
    margin-right: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    i {
      font-size: 19px;
      line-height: 1;
      color: $color-sidebar-icon;
    }
  }

  &__chevron {
    font-size: 15px;
    color: $color-sidebar-icon;
  }

  &__item-label {
    font-size: 13px;
    font-weight: 600;
    color: $color-sidebar-text;
    letter-spacing: 0.01em;
  }

  &__theme {
    padding: 8px 8px 0;
    border-top: 1px solid $color-border;
  }

  &--rail &__theme {
    display: flex;
    justify-content: center;
    padding: 10px 0 0;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
  }

  &--rail &__user {
    flex-direction: column;
    padding: 12px 8px;
    gap: 8px;
  }

  &__user-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: $gradient-brand;
    color: #fff; font-size: 12px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  &__user-info { flex: 1; overflow: hidden; }
  &__user-name { font-size: 12.5px; font-weight: 700; color: $color-text-primary; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &__user-email { font-size: 11px; color: $color-text-muted; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  &__user-role {
    display: inline-block;
    margin-top: 4px;
    padding: 1px 7px;
    border-radius: 999px;
    background: $color-sidebar-active-bg;
    color: $color-sidebar-text-active;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  &__logout-btn {
    all: unset;
    cursor: pointer;
    color: $color-text-muted;
    display: flex;
    padding: 6px;
    border-radius: $radius-sm;

    &:hover { color: $color-danger; background: rgba(242, 85, 90, 0.12); }
  }
}

.main { background: $color-bg-page; }

// Flyout submenu yang muncul di sebelah kanan icon/label group waktu
// hover — berlaku di 2 mode sidebar (penuh maupun rail/icon-only). Bukan
// child dari .sidebar (dirender lewat v-menu Vuetify yang teleport ke
// root), jadi ditulis terpisah di sini.
.sidebar__flyout {
  background: $color-bg-surface;
  border: 1px solid $color-border-strong;
  border-radius: $radius-md;
  padding: 6px;
  min-width: 200px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
}

.sidebar__flyout-title {
  padding: 8px 10px 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: $color-text-muted;
}

.sidebar__flyout-item {
  all: unset;
  box-sizing: border-box;
  display: block;
  width: 100%;
  padding: 9px 10px;
  border-radius: $radius-sm;
  cursor: pointer;
  color: $color-text-primary;
  font-size: 12.5px;
  font-weight: 600;

  &:hover { background: $color-bg-surface-2; }

  &--active {
    color: $color-sidebar-text-active;
    background: $color-sidebar-active-bg;
  }
}

// Tooltip flyout buat menu biasa (nggak punya submenu) di rail mode —
// versi simpel dari .sidebar__flyout, cuma nampilin label, nggak ada
// list. Sama-sama muncul lewat v-menu (teleport ke root), ditulis
// terpisah dari .sidebar untuk alasan yang sama.
.sidebar__tooltip {
  background: $color-bg-surface;
  border: 1px solid $color-border-strong;
  border-radius: $radius-sm;
  padding: 8px 12px;
  font-size: 12.5px;
  font-weight: 600;
  color: $color-text-primary;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
}

// Tombol toggle collapse/expand sidebar — nempel di border kanan. Posisi
// vertikal SENGAJA fixed-pixel (bukan 50% viewport) supaya konsisten
// duduk tepat di bawah baris menu (area kosong sebelum footer tema/user),
// dan nggak numpuk di atas flyout submenu yang muncul waktu hover ke
// "Laporan & Analitik" (item menu paling bawah). z-index juga sengaja
// DI BAWAH layer overlay Vuetify (v-menu ~2400) supaya waktu flyout
// kebuka, flyout-lah yang tampil di depan — bukan toggle yang nabrak di
// atasnya. `left` di-bind inline (lihat template) supaya otomatis ikut
// geser waktu sidebar berubah lebar (248px <-> 72px).
.sidebar-toggle {
  all: unset;
  position: fixed;
  top: 340px;
  transform: translateX(-50%);
  z-index: 1200;
  width: 22px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-bg-surface;
  border: 1px solid $color-border-strong;
  border-radius: $radius-sm;
  color: $color-text-secondary;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.32);
  transition: left .2s ease, background .15s ease, color .15s ease;

  i { font-size: 16px; }

  &:hover {
    background: $color-primary;
    color: #fff;
    border-color: $color-primary;
  }
}
</style>

<style lang="scss">
@use '~/assets/scss/variables' as vars;

.sidebar .v-list-item--active {
  background: vars.$color-sidebar-active-bg !important;

  .v-list-item-title { color: vars.$color-sidebar-text-active !important; }
  .sidebar__icon i { color: vars.$color-sidebar-text-active !important; }
}

// .sidebar__tooltip di sini UNSCOPED sengaja — dipakai lewat prop
// `content-class` di v-tooltip (lihat blok "Group" di template), yang
// bikin elemen wrapper-nya digenerate langsung sama Vuetify sendiri
// (bukan bagian dari template kita), jadi nggak ke-attach atribut scoped
// (data-v-xxx) dan versi scoped dari class ini (yang dipakai buat tooltip
// item biasa lewat v-menu) nggak bakal match ke situ. Duplikat definisi
// singkat di sini biar tetap konsisten secara visual di 2 tempat.
.sidebar__tooltip {
  background: vars.$color-bg-surface;
  border: 1px solid vars.$color-border-strong;
  border-radius: vars.$radius-sm;
  padding: 8px 12px !important;
  font-size: 12.5px;
  font-weight: 600;
  color: vars.$color-text-primary;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
}
</style>
