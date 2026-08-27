<script setup lang="ts">
/**
 * DialogBase
 * ----------
 * Modal generik untuk form/detail. Body dan actions lewat slot supaya
 * isinya bebas, tapi header/footer selalu konsisten.
 *
 * Contoh:
 *   <DialogBase v-model="show" title="Create ticket" width="560">
 *     <template #default> ...form... </template>
 *     <template #actions>
 *       <ButtonBase variant="text" @click="show=false">Cancel</ButtonBase>
 *       <ButtonBase @click="submit">Save</ButtonBase>
 *     </template>
 *   </DialogBase>
 */
withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  width?: string | number
  persistent?: boolean
}>(), {
  title: undefined,
  width: 520,
  persistent: false
})

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="width"
    :persistent="persistent"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="dialog-base">
      <div class="dialog-base__header">
        <h2 class="dialog-base__title">{{ title }}</h2>
        <button class="dialog-base__close" @click="emit('update:modelValue', false)">
          <i class="mdi mdi-close" />
        </button>
      </div>

      <div class="dialog-base__body">
        <slot />
      </div>

      <div v-if="$slots.actions" class="dialog-base__actions">
        <slot name="actions" />
      </div>
    </div>
  </v-dialog>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.dialog-base {
  background: $color-bg-surface;
  border-radius: $radius-lg;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid $color-border;
  }

  &__title {
    font-size: 16px;
    font-weight: 700;
    color: $color-text-primary;
    margin: 0;
  }

  &__close {
    all: unset;
    cursor: pointer;
    color: $color-text-muted;
    display: flex;
    padding: 4px;
    border-radius: 50%;

    &:hover { background: $color-bg-page; color: $color-text-primary; }
  }

  &__body {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 14px 20px;
    border-top: 1px solid $color-border;
  }
}
</style>
