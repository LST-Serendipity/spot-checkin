<template>
  <Teleport to="body">
    <div v-if="isOpen" class="lightbox" @click.self="close" @keydown.esc="close" @keydown.left="prev" @keydown.right="next">
      <button @click="close" class="close-btn"><X class="close-icon" /></button>
      <button v-if="hasPrev" @click="prev" class="nav-btn prev"><ChevronLeft class="nav-icon" /></button>
      <button v-if="hasNext" @click="next" class="nav-btn next"><ChevronRight class="nav-icon" /></button>

      <div class="lightbox-content">
        <img :src="currentImage.url" :alt="`图片 ${currentIndex + 1}`" class="lightbox-image" />
        <div class="lightbox-info">
          <div class="info-row">
            <span>{{ currentIndex + 1 }} / {{ total }}</span>
            <span v-if="currentRating" class="rating"><Star class="star-icon" />{{ currentRating }}</span>
          </div>
          <div v-if="currentComments.length > 0" class="comments-count">{{ currentComments.length }} 条评论</div>
        </div>
      </div>

      <div class="dots">
        <button v-for="(img, idx) in images" :key="img.id" @click="goTo(idx)" class="dot" :class="{ active: idx === currentIndex }" />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, ChevronLeft, ChevronRight, Star } from 'lucide-vue-next'

const props = defineProps({
  images: { type: Array, default: () => [] },
  initialIndex: { type: Number, default: 0 },
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({ get: () => props.modelValue, set: (val) => emit('update:modelValue', val) })
const currentIndex = ref(props.initialIndex)

watch(() => props.initialIndex, (val) => { currentIndex.value = val })

const currentImage = computed(() => props.images[currentIndex.value] || null)
const total = computed(() => props.images.length)
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < props.images.length - 1)

const currentRating = computed(() => {
  const img = currentImage.value
  if (!img?.ratings || img.ratings.length === 0) return null
  const total = img.ratings.reduce((sum, r) => sum + r.score, 0)
  return (total / img.ratings.length).toFixed(1)
})

const currentComments = computed(() => currentImage.value?.ratings || [])

const close = () => { isOpen.value = false }
const prev = () => { if (hasPrev.value) currentIndex.value-- }
const next = () => { if (hasNext.value) currentIndex.value++ }
const goTo = (index) => { currentIndex.value = index }
</script>

<style scoped>
.lightbox { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.95); z-index: 100; display: flex; align-items: center; justify-content: center; }
.close-btn { position: absolute; top: 16px; right: 16px; color: rgba(255, 255, 255, 0.8); background: none; border: none; cursor: pointer; padding: 8px; transition: color 150ms; }
.close-btn:hover { color: white; }
.close-icon { width: 32px; height: 32px; }
.nav-btn { position: absolute; color: rgba(255, 255, 255, 0.8); background: none; border: none; cursor: pointer; padding: 8px; transition: color 150ms; }
.nav-btn:hover { color: white; }
.nav-btn.prev { left: 16px; }
.nav-btn.next { right: 16px; }
.nav-icon { width: 40px; height: 40px; }
.lightbox-content { max-width: 1152px; max-height: 90vh; padding: 0 16px; }
.lightbox-image { max-width: 100%; max-height: 80vh; object-fit: contain; }
.lightbox-info { margin-top: 16px; text-align: center; color: rgba(255, 255, 255, 0.8); }
.info-row { display: flex; align-items: center; justify-content: center; gap: 16px; }
.rating { display: flex; align-items: center; gap: 4px; }
.star-icon { width: 16px; height: 16px; color: #facc15; fill: #facc15; }
.comments-count { margin-top: 8px; font-size: 14px; }
.dots { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, 0.3); border: none; cursor: pointer; transition: background 150ms; }
.dot:hover { background: rgba(255, 255, 255, 0.5); }
.dot.active { background: white; }
</style>
