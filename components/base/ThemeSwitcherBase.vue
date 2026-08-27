<script setup lang="ts">
/**
 * ThemeSwitcherBase
 * -----------------
 * Dropdown pemilih tema (Dark Violet / Light / Blue Sky). Taruh di
 * layout mana pun — semua state-nya lewat composable useAppTheme(),
 * jadi tetap sinkron walau dipanggil dari beberapa tempat sekaligus.
 *
 * Prop `compact`: dipakai waktu sidebar dalam mode rail (icon-only) —
 * trigger jadi lingkaran icon palette berwarna sesuai tema aktif (bukan
 * cuma titik polos), biar tetap jelas fungsinya walau tanpa label. Waktu
 * compact DAN device beneran punya hover (mouse desktop — dicek lewat
 * useHoverCapable), dropdown-nya juga bisa dibuka dengan HOVER selain
 * klik biasa. Di touch/HP, hover DIMATIKAN (cuma klik) — kalau dipaksa
 * nyala di touch, dropdown-nya bisa nyangkut kebuka terus karena nggak
 * ada event "hover keluar" beneran di touch device. Isi dropdown-nya
 * (menu pilihan) TETAP full label seperti biasa, karena itu overlay yang
 * muncul di atas konten lain, jadi nggak kena batasan lebar sidebar.
 */
import { useAppTheme } from '~/composables/useAppTheme'
import { useHoverCapable } from '~/composables/useHoverCapable'

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const { current, themes, setTheme } = useAppTheme()
const { supportsHover } = useHoverCapable()
const menuOpen = ref(false)

function pick(key: keyof typeof themes) {
  setTheme(key)
  menuOpen.value = false
}
</script>

<template>
  <v-menu
    v-model="menuOpen"
    :location="compact ? 'end' : 'top'"
    offset="8"
    :open-on-hover="compact && supportsHover"
    open-delay="120"
    close-delay="150"
  >
    <template #activator="{ props: activatorProps }">
      <button
        class="theme-switch-base__trigger"
        :class="{ 'theme-switch-base__trigger--compact': compact }"
        v-bind="activatorProps"
        type="button"
      >
        <template v-if="compact">
          <span class="theme-switch-base__icon-badge" :style="{ background: themes[current].swatch }">
            <i class="mdi mdi-palette-outline" />
          </span>
        </template>
        <template v-else>
          <span class="theme-switch-base__dot" :style="{ background: themes[current].swatch }" />
          <span class="theme-switch-base__label">{{ themes[current].label }}</span>
          <i class="mdi mdi-chevron-up theme-switch-base__chevron" :class="{ 'theme-switch-base__chevron--open': menuOpen }" />
        </template>
      </button>
    </template>

    <div class="theme-switch-base__menu">
      <button
        v-for="(meta, key) in themes"
        :key="key"
        type="button"
        class="theme-switch-base__option"
        :class="{ 'theme-switch-base__option--active': key === current }"
        @click="pick(key)"
      >
        <span class="theme-switch-base__dot" :style="{ background: meta.swatch }" />
        <span>{{ meta.label }}</span>
        <i v-if="key === current" class="mdi mdi-check theme-switch-base__check" />
      </button>
    </div>
  </v-menu>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.theme-switch-base {
  &__trigger {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    border-radius: $radius-sm;
    cursor: pointer;
    color: $color-text-secondary;
    font-size: 12px;
    font-weight: 600;

    &:hover {
      background: $color-bg-surface-2;

      .theme-switch-base__chevron { color: $color-text-primary; }
    }

    &--compact {
      width: 32px;
      height: 32px;
      padding: 0;
      justify-content: center;
      margin: 0 auto;

      &:hover { background: transparent; }
    }
  }

  &__icon-badge {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform .15s ease, box-shadow .15s ease;
    box-shadow: 0 0 0 1px $color-border-strong;

    i { font-size: 16px; color: #fff; }

    .theme-switch-base__trigger:hover & {
      transform: scale(1.06);
      box-shadow: 0 0 0 2px $color-primary-glow;
    }
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__label { flex: 1; text-align: left; }

  &__chevron {
    font-size: 16px;
    font-weight: 700;
    color: $color-text-secondary;
    transition: transform .15s ease, color .15s ease;

    &--open { transform: rotate(180deg); color: $color-primary; }
  }

  &__menu {
    background: $color-bg-surface;
    border: 1px solid $color-border-strong;
    border-radius: $radius-md;
    padding: 6px;
    min-width: 180px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
  }

  &__option {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border-radius: $radius-sm;
    cursor: pointer;
    color: $color-text-primary;
    font-size: 12.5px;
    font-weight: 600;

    &:hover { background: $color-bg-surface-2; }
    &--active { color: $color-primary; }
  }

  &__check { margin-left: auto; font-size: 15px; color: $color-primary; }
}
</style>
