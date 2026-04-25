<template>
  <div class="spot-detail">
    <div v-if="loading" class="loading-state">
      <div class="images-grid">
        <div v-for="i in 8" :key="i" class="skeleton" />
      </div>
    </div>

    <div v-else-if="!spot" class="not-found">
      <p class="not-found-text">{{ $t('spot.notFound') || 'Spot not found' }}</p>
      <router-link to="/" class="back-link">
        {{ $t('common.back') }}
      </router-link>
    </div>

    <div v-else>
      <div class="spot-header">
        <div class="spot-info">
          <h1 class="spot-name">{{ spot.name }}</h1>
          <p class="spot-location">
            <MapPin class="location-icon" />
            {{ spot.location || $t('spot.location') }}
          </p>
          <p v-if="spot.description" class="spot-description">
            {{ spot.description }}
          </p>
        </div>
        <router-link
          :to="`/spots/${spot.id}/upload`"
          class="btn btn-primary"
        >
          <Upload class="btn-icon" />
          {{ $t('spot.upload') }}
        </router-link>
      </div>

      <div class="cycle-info-card">
        <div class="cycle-header">
          <div class="cycle-time">
            <Clock class="cycle-icon" />
            <span class="cycle-label">{{ $t('spot.cycleRemaining') }}</span>
            <span class="cycle-value">
              {{ cycleInfo.timeLeft.days }}天 {{ cycleInfo.timeLeft.hours }}时 {{ cycleInfo.timeLeft.minutes }}分
            </span>
          </div>
          <div class="sort-control">
            <label class="sort-label">{{ $t('common.sort') || 'Sort:' }}</label>
            <select v-model="sortBy" class="sort-select">
              <option value="newest">{{ $t('spot.sortNewest') }}</option>
              <option value="rating">{{ $t('spot.sortRating') }}</option>
              <option value="comments">{{ $t('spot.sortComments') }}</option>
            </select>
          </div>
        </div>
        <p class="cycle-hint">{{ $t('spot.cycleInfo') }}</p>
      </div>

      <div v-if="images.length > 0" class="images-grid">
        <ImageCard
          v-for="image in sortedImages"
          :key="image.id"
          :image="image"
          @view="openImageModal(image)"
        />
      </div>

      <div v-else class="empty-state">
        <ImageIcon class="empty-icon" />
        <p class="empty-text">{{ $t('spot.noImages') }}</p>
        <router-link :to="`/spots/${spot.id}/upload`" class="upload-link">
          {{ $t('spot.upload') }}
        </router-link>
      </div>
    </div>

    <ImageModal
      v-if="selectedImage"
      :image="selectedImage"
      :comments="imageComments"
      :all-images="images"
      @close="selectedImage = null"
      @rate="handleRate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Loader2, MapPin, Upload, Clock, ImageIcon } from 'lucide-vue-next'
import { useSpotsStore } from '@/stores/spots'
import { useImages } from '@/composables/useImages'
import { useRatings } from '@/composables/useRatings'
import { useCycle } from '@/composables/useCycle'
import ImageCard from '@/components/ImageCard.vue'
import ImageModal from '@/components/ImageModal.vue'

const route = useRoute()
const spotsStore = useSpotsStore()
const { images, fetchImagesBySpot } = useImages()
const { getRatingsByImage, addRating } = useRatings()
const { getCurrentCycleInfo } = useCycle()

const loading = ref(true)
const spot = ref(null)
const selectedImage = ref(null)
const imageComments = ref([])
const cycleInfo = computed(() => getCurrentCycleInfo())
const sortBy = ref('newest')

const sortedImages = computed(() => {
  const imgs = [...images.value]
  switch (sortBy.value) {
    case 'rating':
      return imgs.sort((a, b) => {
        const avgA = a.ratings?.length ? a.ratings.reduce((s, r) => s + r.score, 0) / a.ratings.length : 0
        const avgB = b.ratings?.length ? b.ratings.reduce((s, r) => s + r.score, 0) / b.ratings.length : 0
        return avgB - avgA
      })
    case 'comments':
      return imgs.sort((a, b) => (b.ratings?.length || 0) - (a.ratings?.length || 0))
    default:
      return imgs
  }
})

const loadData = async () => {
  loading.value = true
  const spotId = route.params.id
  spot.value = await spotsStore.fetchSpotById(spotId)
  await fetchImagesBySpot(spotId)
  loading.value = false
}

const openImageModal = async (image) => {
  selectedImage.value = { ...image }
  imageComments.value = image.ratings || []
}

const handleRate = async ({ score, comment }) => {
  await addRating(selectedImage.value.id, score, comment)
  await fetchImagesBySpot(route.params.id)

  const updatedImage = images.value.find(img => img.id === selectedImage.value.id)
  if (updatedImage) {
    selectedImage.value = { ...updatedImage }
    imageComments.value = updatedImage.ratings || []
  }
}

onMounted(loadData)
</script>

<style scoped>
.spot-detail {
  padding: 0;
}

.loading-state {
  text-align: center;
  padding: 48px 0;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .images-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .images-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.skeleton {
  background-color: #e5e7eb;
  border-radius: 8px;
  aspect-ratio: 1;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.not-found {
  text-align: center;
  padding: 48px 0;
}

.not-found-text {
  color: #6b7280;
}

.back-link {
  display: inline-block;
  margin-top: 8px;
  color: #0ea5e9;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.spot-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.spot-name {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.spot-location {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  color: #6b7280;
}

.location-icon {
  width: 16px;
  height: 16px;
}

.spot-description {
  margin-top: 8px;
  color: #4b5563;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 150ms;
  cursor: pointer;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background-color: #0ea5e9;
  color: white;
}

.btn-primary:hover {
  background-color: #0284c7;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.cycle-info-card {
  background-color: rgba(239, 246, 255, 0.5);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.cycle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.cycle-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.cycle-icon {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.cycle-label {
  color: #374151;
}

.cycle-value {
  font-weight: 600;
  color: #1d4ed8;
}

.sort-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-label {
  font-size: 14px;
  color: #4b5563;
}

.sort-select {
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
  outline: none;
}

.sort-select:focus {
  border-color: #0ea5e9;
}

.cycle-hint {
  font-size: 12px;
  color: #2563eb;
  margin-top: 8px;
}

.empty-state {
  text-align: center;
  padding: 64px 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 8px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  color: #d1d5db;
}

.empty-text {
  margin-top: 16px;
  color: #6b7280;
}

.upload-link {
  display: inline-block;
  margin-top: 16px;
  color: #0ea5e9;
  text-decoration: none;
}

.upload-link:hover {
  text-decoration: underline;
}
</style>
