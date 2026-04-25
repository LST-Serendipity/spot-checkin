<template>
  <div class="spot-card">
    <router-link :to="`/spots/${spot.id}`" class="card-link">
      <div class="card-image">
        <img v-if="spot.cover_image" :src="spot.cover_image" :alt="spot.name" class="image" />
        <div v-else class="placeholder"><ImageIcon class="placeholder-icon" /></div>
      </div>
      <div class="card-content">
        <h3 class="card-title">{{ spot.name }}</h3>
        <p class="card-location"><MapPin class="location-icon" />{{ spot.location || $t('spot.location') }}</p>
        <p class="card-desc">{{ spot.description || $t('spot.description') }}</p>
        <div class="card-footer">
          <span class="card-date">{{ $t('spot.createdAt') }} {{ formatDate(spot.created_at) }}</span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { ImageIcon, MapPin } from 'lucide-vue-next'

defineProps({ spot: { type: Object, required: true } })

const formatDate = (date) => { if (!date) return ''; return new Date(date).toLocaleDateString() }
</script>

<style scoped>
.spot-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px); border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; transition: box-shadow 150ms; }
.spot-card:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.card-link { text-decoration: none; color: inherit; }
.card-image { aspect-ratio: 4/3; background: #f3f4f6; overflow: hidden; }
.image { width: 100%; height: 100%; object-fit: cover; transition: transform 300ms; }
.spot-card:hover .image { transform: scale(1.05); }
.placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af; }
.placeholder-icon { width: 48px; height: 48px; }
.card-content { padding: 16px; }
.card-title { font-weight: 600; font-size: 18px; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-location { font-size: 14px; color: #6b7280; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
.location-icon { width: 16px; height: 16px; }
.card-desc { font-size: 14px; color: #4b5563; margin-top: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-footer { margin-top: 12px; display: flex; align-items: center; justify-content: space-between; }
.card-date { font-size: 12px; color: #9ca3af; }
</style>
