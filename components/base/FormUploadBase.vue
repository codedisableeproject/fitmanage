<script setup lang="ts">
/**
 * FormUploadBase
 * --------------
 * Upload file dengan drag & drop + klik. v-model berisi File[]
 * (selalu array, meskipun multiple=false, supaya pemakaian konsisten).
 *
 * Contoh:
 *   <FormUploadBase v-model="files" accept=".pdf,.jpg,.png" :max-size-mb="5" />
 */
const props = withDefaults(defineProps<{
  modelValue: File[]
  label?: string
  accept?: string
  multiple?: boolean
  maxSizeMb?: number
  hint?: string
}>(), {
  label: 'Upload file',
  accept: undefined,
  multiple: false,
  maxSizeMb: 10,
  hint: undefined
})

const emit = defineEmits<{ 'update:modelValue': [File[]] }>()

const isDragging = ref(false)
const error = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function pickFile() {
  inputRef.value?.click()
}

function validateAndSet(fileList: FileList | null) {
  if (!fileList || fileList.length === 0) return
  error.value = ''
  const files = Array.from(fileList)

  for (const f of files) {
    if (f.size > props.maxSizeMb * 1024 * 1024) {
      error.value = `File "${f.name}" melebihi ${props.maxSizeMb}MB.`
      return
    }
  }

  emit('update:modelValue', props.multiple ? [...props.modelValue, ...files] : [files[0]])
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  validateAndSet(e.dataTransfer?.files ?? null)
}

function onInputChange(e: Event) {
  validateAndSet((e.target as HTMLInputElement).files)
  if (inputRef.value) inputRef.value.value = ''
}

function removeFile(idx: number) {
  const next = [...props.modelValue]
  next.splice(idx, 1)
  emit('update:modelValue', next)
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div class="upload-base">
    <label v-if="label" class="upload-base__label">{{ label }}</label>

    <div
      class="upload-base__dropzone"
      :class="{ 'upload-base__dropzone--drag': isDragging }"
      @click="pickFile"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <i class="mdi mdi-cloud-upload-outline upload-base__icon" />
      <p class="upload-base__text">
        <span class="upload-base__link">Click to upload</span> or drag and drop
      </p>
      <p v-if="hint" class="upload-base__hint">{{ hint }}</p>

      <input
        ref="inputRef"
        type="file"
        class="upload-base__input"
        :accept="accept"
        :multiple="multiple"
        @change="onInputChange"
      >
    </div>

    <p v-if="error" class="upload-base__error">{{ error }}</p>

    <ul v-if="modelValue.length" class="upload-base__list">
      <li v-for="(f, i) in modelValue" :key="f.name + i" class="upload-base__file">
        <i class="mdi mdi-file-outline" />
        <span class="upload-base__file-name">{{ f.name }}</span>
        <span class="upload-base__file-size">{{ formatSize(f.size) }}</span>
        <button type="button" class="upload-base__remove" @click="removeFile(i)">
          <i class="mdi mdi-close" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.upload-base {
  &__label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: $color-text-primary;
    margin-bottom: 6px;
  }

  &__dropzone {
    position: relative;
    border: 1.5px dashed $color-border-strong;
    border-radius: $radius-md;
    padding: 28px 16px;
    text-align: center;
    cursor: pointer;
    background: $color-bg-page;
    transition: border-color .15s ease, background .15s ease;

    &:hover, &--drag {
      border-color: $color-primary;
      background: $color-primary-light;
    }
  }

  &__icon {
    font-size: 28px;
    color: $color-text-muted;
  }

  &__text {
    margin: 8px 0 0;
    font-size: 13px;
    color: $color-text-secondary;
  }

  &__link {
    color: $color-primary;
    font-weight: 600;
  }

  &__hint {
    margin: 4px 0 0;
    font-size: 11px;
    color: $color-text-muted;
  }

  &__input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  &__error {
    margin: 6px 0 0;
    font-size: 12px;
    color: $color-danger;
  }

  &__list {
    list-style: none;
    margin: 10px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__file {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    font-size: 12px;
    color: $color-text-primary;
  }

  &__file-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__file-size {
    color: $color-text-muted;
  }

  &__remove {
    all: unset;
    cursor: pointer;
    color: $color-text-muted;
    display: flex;

    &:hover { color: $color-danger; }
  }
}
</style>
