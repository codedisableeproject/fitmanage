<script setup lang="ts">
/**
 * TabBase
 * -------
 * Tab bar dinamis di atas konten, mirip pola "ICON Apps":
 * - Semua tab (termasuk Dashboard) bisa ditutup selama masih ada tab lain
 *   yang terbuka.
 * - Tab terakhir yang tersisa (apa pun itu) tidak pernah bisa ditutup —
 *   selalu harus ada minimal 1 tab aktif.
 *
 * Cara pakai dari sidebar menu:
 *   const { openTab } = useTabs()
 *   openTab({ key: 'members', label: 'Members', to: '/members' })
 */
import { useTabs } from '~/composables/useTabs'

const { tabs, activeKey, closeTab, setActive } = useTabs()

function isClosable(tab: { key: string; closable?: boolean }) {
  if (tabs.value.length <= 1) return false
  return tab.closable !== false
}
</script>

<template>
  <div class="tab-base" role="tablist" aria-label="Open pages">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      class="tab-base__item"
      :class="{ 'tab-base__item--active': tab.key === activeKey }"
      :aria-selected="tab.key === activeKey"
      @click="setActive(tab)"
    >
      <span class="tab-base__label">{{ tab.label }}</span>
      <i
        v-if="isClosable(tab)"
        class="mdi mdi-close tab-base__close"
        aria-label="Close tab"
        @click.stop="closeTab(tab.key)"
      />
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.tab-base {
  display: flex;
  align-items: stretch;
  height: $tabbar-height;
  background: $color-bg-surface;
  border-bottom: 1px solid $color-border;
  overflow-x: auto;
  overflow-y: hidden;

  &__item {
    all: unset;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: $color-text-secondary;
    border-right: 1px solid $color-border;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    white-space: nowrap;
    transition: color .15s ease, background .15s ease;

    &:hover {
      background: $color-bg-page;
      color: $color-text-primary;
    }

    &--active {
      color: $color-primary;
      border-bottom-color: $color-primary;
      background: $color-primary-light;
    }
  }

  &__close {
    font-size: 14px;
    border-radius: 50%;
    padding: 2px;
    color: $color-text-muted;

    &:hover {
      background: rgba(0, 0, 0, 0.08);
      color: $color-text-primary;
    }
  }
}
</style>
