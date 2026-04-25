<template>
  <div class="star-rating">
    <button v-for="star in 5" :key="star" @click="!readonly && emit('update:modelValue', star)" class="star-btn" :class="{ readonly: readonly }">
      <Star class="star-icon" :class="star <= (modelValue || 0) ? 'filled' : 'empty'" />
    </button>
    <span v-if="showLabel" class="rating-label">{{ ratingLabels[modelValue - 1] || '' }}</span>
  </div>
</template>

<script setup>
import { Star } from 'lucide-vue-next'

defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false },
  showLabel: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const ratingLabels = ['很差', '较差', '一般', '很好', '非常好']
</script>

<style scoped>
.star-rating { display: flex; align-items: center; gap: 4px; }
.star-btn { background: none; border: none; padding: 0; cursor: pointer; transition: transform 150ms; }
.star-btn:not(.readonly):hover { transform: scale(1.1); }
.star-btn.readonly { cursor: default; }
.star-icon { width: 24px; height: 24px; transition: color 150ms; }
.star-icon.filled { color: #facc15; fill: #facc15; }
.star-icon.empty { color: #d1d5db; }
.rating-label { margin-left: 8px; font-size: 14px; color: #6b7280; }
</style>
