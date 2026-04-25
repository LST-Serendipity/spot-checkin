<template>
  <div
    class="upload-zone"
    :class="{ dragging: isDragging, disabled: disabled }"
    @dragover.prevent="!disabled && (isDragging = true)"
    @dragleave="isDragging = false"
    @drop.prevent="!disabled && handleDrop"
    @click="!disabled && fileInput?.click()"
  >
    <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />
    <Upload class="upload-icon" />
    <p class="upload-text">拖拽图片到此处，或 <span class="highlight">点击选择</span></p>
    <p class="upload-hint">支持 JPG、PNG 格式，单张不超过 5MB</p>
    <p v-if="maxFiles" class="upload-limit">最多上传 {{ maxFiles }} 张图片</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Upload } from 'lucide-vue-next'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  maxFiles: { type: Number, default: 10 }
})

const emit = defineEmits(['upload'])

const fileInput = ref(null)
const isDragging = ref(false)

const validateFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
  const maxSize = 5 * 1024 * 1024
  if (!validTypes.includes(file.type)) { alert(`${file.name} 格式不支持`); return false }
  if (file.size > maxSize) { alert(`${file.name} 文件过大，请压缩后上传`); return false }
  return true
}

const handleFiles = (files) => {
  const validFiles = Array.from(files).filter(validateFile)
  if (validFiles.length > 0) emit('upload', validFiles)
}

const handleDrop = (e) => { isDragging.value = false; handleFiles(e.dataTransfer.files) }
const handleFileSelect = (e) => { handleFiles(e.target.files) }
</script>

<style scoped>
.upload-zone { border: 2px dashed #d1d5db; border-radius: 8px; padding: 32px; text-align: center; cursor: pointer; transition: all 150ms; }
.upload-zone:hover:not(.disabled) { border-color: #0ea5e9; }
.upload-zone.dragging { border-color: #0ea5e9; background: #f0f9ff; }
.upload-zone.disabled { opacity: 0.5; cursor: not-allowed; }
.upload-icon { width: 48px; height: 48px; margin: 0 auto 12px; color: #9ca3af; }
.upload-text { color: #4b5563; margin-bottom: 4px; }
.upload-text .highlight { color: #0ea5e9; }
.upload-hint { font-size: 14px; color: #9ca3af; }
.upload-limit { font-size: 12px; color: #9ca3af; margin-top: 8px; }
.hidden { display: none; }
</style>
