<template>
  <div class="not-found">
    <div class="not-found-content">
      <MapPin class="not-found-icon" />
      <h1 class="not-found-title">404</h1>
      <p class="not-found-text">{{ $t('404.title') }}</p>
      <p class="not-found-description">{{ $t('404.description') }}</p>
      <router-link to="/" class="btn btn-primary">
        <Home class="btn-icon" />
        {{ $t('404.backHome') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { MapPin, Home } from 'lucide-vue-next'
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.not-found-content {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 48px 32px;
  max-width: 480px;
  width: 100%;
}

.not-found-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  color: #d1d5db;
}

.not-found-title {
  font-size: 72px;
  font-weight: 800;
  color: #111827;
  margin: 16px 0 0;
  line-height: 1;
}

.not-found-text {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin-top: 8px;
}

.not-found-description {
  color: #6b7280;
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 150ms;
  cursor: pointer;
  border: none;
  text-decoration: none;
  margin-top: 24px;
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
</style>
