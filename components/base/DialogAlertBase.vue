<script setup lang="ts">
/**
 * DialogAlertBase
 * ----------------
 * Satu instance ditaruh di layouts/default.vue (root). Dari halaman mana
 * pun, panggil lewat composable:
 *
 *   const alert = useAlert()
 *   alert.success('Ticket created')
 *   alert.error('Failed to save', 'Please check the required fields.')
 *   const ok = await alert.confirm('Delete this ticket?', 'This action cannot be undone.')
 */
import { useAlert } from '~/composables/useAlert'

const { state, close } = useAlert()

const iconMap: Record<string, string> = {
  success: 'mdi-check-circle',
  error: 'mdi-close-circle',
  warning: 'mdi-alert-circle',
  confirm: 'mdi-help-circle'
}
const colorClassMap: Record<string, string> = {
  success: 'alert-base__icon--success',
  error: 'alert-base__icon--error',
  warning: 'alert-base__icon--warning',
  confirm: 'alert-base__icon--confirm'
}
</script>

<template>
  <v-dialog :model-value="state.show" max-width="380" persistent @update:model-value="close(false)">
    <div class="alert-base">
      <i class="mdi alert-base__icon" :class="[iconMap[state.type], colorClassMap[state.type]]" />
      <h3 class="alert-base__title">{{ state.title }}</h3>
      <p v-if="state.message" class="alert-base__message">{{ state.message }}</p>

      <div class="alert-base__actions">
        <ButtonBase v-if="state.type === 'confirm'" variant="text" @click="close(false)">
          {{ state.cancelText }}
        </ButtonBase>
        <ButtonBase
          :variant="state.type === 'error' ? 'danger' : 'primary'"
          @click="close(true)"
        >
          {{ state.confirmText }}
        </ButtonBase>
      </div>
    </div>
  </v-dialog>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.alert-base {
  background: $color-bg-surface;
  border-radius: $radius-lg;
  padding: 28px 24px 20px;
  text-align: center;

  &__icon {
    font-size: 44px;
    margin-bottom: 12px;

    &--success { color: $color-success; }
    &--error { color: $color-danger; }
    &--warning { color: $color-warning; }
    &--confirm { color: $color-primary; }
  }

  &__title {
    font-size: 16px;
    font-weight: 700;
    color: $color-text-primary;
    margin: 0 0 6px;
  }

  &__message {
    font-size: 13px;
    color: $color-text-secondary;
    margin: 0 0 20px;
  }

  &__actions {
    display: flex;
    justify-content: center;
    gap: 10px;
  }
}
</style>
