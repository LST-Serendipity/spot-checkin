<template>
  <div class="image-card">
    <div class="image-wrapper">
      <img :src="image.url" :alt="`Image ${image.id}`" class="image" @click="$emit('view', image)" />
      <div v-if="image.is_kept" class="badge kept"><Star class="badge-icon" fill="currentColor" />{{ $t('image.permanent') }}</div>
      <div v-if="showScore" class="badge score">{{ displayRating }}</div>
    </div>
    <div class="card-footer">
      <span class="date">{{ formatDate(image.created_at) }}</span>
      <button v-if="showDelete" @click="$emit('delete', image.id)" class="delete-btn">{{ $t('common.delete') }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Star } from 'lucide-vue-next'

const { t } = useI18n()

const props = defineProps({
  image: { type: Object, required: true },
  showScore: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: false }
})

defineEmits(['view', 'delete'])

const displayRating = computed(() => {
  const ratings = props.image.ratings || []
  if (ratings.length === 0) return t('image.rating')
  const total = ratings.reduce((sum, r) => sum + r.score, 0)
  const avg = (total / ratings.length).toFixed(1)
  return `${avg} (${ratings.length})`
})

const formatDate = (date) => { if (!date) return ''; return new Date(date).toLocaleDateString() }
</script>

<style scoped>
.image-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px); border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
.image-wrapper { aspect-ratio: 1; background: #f3f4f6; position: relative; }
.image { width: 100%; height: 100%; object-fit: cover; cursor: pointer; transition: opacity 150ms; }
.image:hover { opacity: 0.9; }
.badge { position: absolute; display: flex; align-items: center; gap: 4px; font-size: 12px; padding: 4px 8px; border-radius: 9999px; }
.badge-icon { width: 12px; height: 12px; }
.badge.kept { top: 8px; right: 8px; background: #eab308; color: white; }
.badge.score { bottom: 8px; left: 8px; background: rgba(0, 0, 0, 0.6); color: white; }
.card-footer { padding: 12px; background: white; display: flex; align-items: center; justify-content: space-between; }
.date { font-size: 12px; color: #9ca3af; }
.delete-btn { color: #ef4444; font-size: 14px; background: none; border: none; cursor: pointer; }
.delete-btn:hover { color: #dc2626; }
</style>
