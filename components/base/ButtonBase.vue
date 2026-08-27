<script setup lang="ts">
/**
 * ButtonBase
 * ----------
 * Wrapper tipis di atas v-btn supaya semua tombol di app konsisten:
 * variant, radius, loading state, icon. Pakai ini, jangan v-btn langsung,
 * biar kalau style tombol berubah cukup edit 1 file.
 *
 * variant: 'primary' | 'secondary' | 'outline' | 'text' | 'danger'
 *
 * Prop `iconOnly`: tombol kotak kecil isinya icon doang (nggak ada teks/
 * margin kiri-kanan) — dipakai buat aksi ringkas kayak pagination
 * (‹ ›) atau tombol hapus di baris tabel. Wajib isi `icon` kalau
 * `iconOnly` true.
 */
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger'
  icon?: string
  iconOnly?: boolean
  loading?: boolean
  disabled?: boolean
  block?: boolean
  size?: 'small' | 'default' | 'large'
  type?: 'button' | 'submit'
  ariaLabel?: string
}>(), {
  variant: 'primary',
  icon: undefined,
  iconOnly: false,
  loading: false,
  disabled: false,
  block: false,
  size: 'default',
  type: 'button',
  ariaLabel: undefined
})

defineEmits<{ click: [MouseEvent] }>()

const variantMap: Record<string, { color: string; flat: boolean; variant: 'flat' | 'outlined' | 'text' }> = {
  primary:   { color: 'primary', flat: true,  variant: 'flat' },
  secondary: { color: 'secondary', flat: true, variant: 'flat' },
  outline:   { color: 'primary', flat: false, variant: 'outlined' },
  text:      { color: 'primary', flat: false, variant: 'text' },
  danger:    { color: 'error',  flat: true,  variant: 'flat' }
}
</script>

<template>
  <v-btn
    :color="variantMap[variant].color"
    :variant="variantMap[variant].variant"
    :icon="iconOnly"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :size="size"
    :type="type"
    :aria-label="ariaLabel"
    class="button-base"
    :class="{ 'button-base--icon-only': iconOnly }"
    @click="$emit('click', $event)"
  >
    <i
      v-if="icon"
      class="mdi"
      :class="icon"
      :style="iconOnly ? 'font-size: 18px;' : 'margin-right: 6px; font-size: 18px;'"
    />
    <slot />
  </v-btn>
</template>

<style scoped lang="scss">
.button-base {
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0;
  box-shadow: none !important;

  &--icon-only {
    border-radius: 6px;
  }
}
</style>
