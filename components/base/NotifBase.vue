<script setup lang="ts">
/**
 * NotifBase
 * ---------
 * Toast notification, taruh sekali di layouts/default.vue.
 * Trigger dari mana saja:
 *   const notif = useNotif()
 *   notif.success('Data saved')
 */
import { useNotif } from '~/composables/useNotif'

const { state, remove } = useNotif()

const iconMap: Record<string, string> = {
  success: 'mdi-check-circle',
  error: 'mdi-close-circle',
  warning: 'mdi-alert-circle',
  info: 'mdi-information'
}
</script>

<template>
  <div class="notif-base">
    <transition-group name="notif-base__fade" tag="div">
      <div
        v-for="item in state.items"
        :key="item.id"
        class="notif-base__item"
        :class="`notif-base__item--${item.type}`"
      >
        <i class="mdi" :class="iconMap[item.type]" />
        <span class="notif-base__message">{{ item.message }}</span>
        <button class="notif-base__close" @click="remove(item.id)">
          <i class="mdi mdi-close" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.notif-base {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 320px;

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: $radius-md;
    background: $color-bg-surface;
    border: 1px solid $color-border;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    font-size: 13px;

    i:first-child { font-size: 18px; }

    &--success i:first-child { color: $color-success; }
    &--error i:first-child { color: $color-danger; }
    &--warning i:first-child { color: $color-warning; }
    &--info i:first-child { color: $color-primary; }
  }

  &__message {
    flex: 1;
    color: $color-text-primary;
  }

  &__close {
    all: unset;
    cursor: pointer;
    color: $color-text-muted;
    display: flex;

    &:hover { color: $color-text-primary; }
  }

  &__fade-enter-active, &__fade-leave-active {
    transition: opacity .2s ease, transform .2s ease;
  }
  &__fade-enter-from, &__fade-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }
}
</style>
