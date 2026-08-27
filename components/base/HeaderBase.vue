<script setup lang="ts">
/**
 * HeaderBase
 * ----------
 * Header halaman: judul besar di atas, baris filter/search di bawahnya
 * (persis pola "FOLLOW UP TASK" pada referensi). Filter dikirim lewat
 * slot supaya bentuknya bisa beda-beda tiap halaman.
 */
withDefaults(defineProps<{
  title: string
  subtitle?: string
}>(), {
  subtitle: undefined
})
</script>

<template>
  <div class="header-base">
    <div class="header-base__title-row">
      <div>
        <h1 class="header-base__title">{{ title }}</h1>
        <p v-if="subtitle" class="header-base__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="header-base__actions">
        <slot name="actions" />
      </div>
    </div>

    <div v-if="$slots.filters" class="header-base__filters">
      <slot name="filters" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.header-base {
  padding: 20px 24px 0;

  &__title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 20px;
    font-weight: 700;
    color: $color-text-primary;
    margin: 0;
  }

  &__subtitle {
    font-size: 13px;
    color: $color-text-secondary;
    margin: 4px 0 0;
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
}
</style>
