<template>
  <div class="home">
    <VisitReminder v-if="showReminder" @close="showReminder = false" />

    <div class="home-header">
      <h1 class="home-title">{{ $t('home.title') }}</h1>
      <router-link
        to="/create-spot"
        class="btn btn-primary"
      >
        <Plus class="btn-icon" />
        {{ $t('home.addSpot') }}
      </router-link>
    </div>

    <div class="search-container">
      <div class="search-box">
        <Search class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('home.searchPlaceholder')"
          class="search-input"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <Loader2 class="loading-icon" />
      <p class="loading-text">{{ $t('common.loading') }}</p>
    </div>

    <div v-else-if="filteredSpots.length === 0 && searchQuery" class="empty-state">
      <Search class="empty-icon" />
      <p class="empty-text">{{ $t('home.noResults') }}</p>
      <p class="empty-hint">{{ $t('home.tryAgain') }}</p>
    </div>

    <div v-else-if="spots.length === 0" class="empty-state">
      <ImageIcon class="empty-icon" />
      <p class="empty-text">{{ $t('home.noSpots') }}</p>
    </div>

    <div v-else class="spots-grid">
      <SpotCard v-for="spot in filteredSpots" :key="spot.id" :spot="spot" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Plus, Loader2, ImageIcon, Search } from 'lucide-vue-next'
import { useSpotsStore } from '@/stores/spots'
import SpotCard from '@/components/SpotCard.vue'
import VisitReminder from '@/components/VisitReminder.vue'

const spotsStore = useSpotsStore()
const loading = ref(true)
const showReminder = ref(false)
const searchQuery = ref('')

const spots = computed(() => spotsStore.spots)

const filteredSpots = computed(() => {
  if (!searchQuery.value.trim()) {
    return spots.value
  }
  const query = searchQuery.value.toLowerCase().trim()
  return spots.value.filter(spot =>
    spot.name.toLowerCase().includes(query) ||
    (spot.location && spot.location.toLowerCase().includes(query))
  )
})

onMounted(async () => {
  await spotsStore.fetchSpots()
  if (!localStorage.getItem('visitedSpotCheckin')) {
    showReminder.value = true
  }
  loading.value = false
})
</script>

<style scoped>
.home {
  padding: 0;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.home-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
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

.search-container {
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  max-width: 448px;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 4px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 8px 16px 8px 40px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  background: transparent;
  outline: none;
}

.search-input:focus {
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.3);
}

.loading-state {
  text-align: center;
  padding: 48px 0;
}

.loading-icon {
  width: 32px;
  height: 32px;
  margin: 0 auto;
  color: #0ea5e9;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 8px;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 48px 0;
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

.empty-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #9ca3af;
}

.spots-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 24px;
}

@media (min-width: 768px) {
  .spots-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .spots-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
