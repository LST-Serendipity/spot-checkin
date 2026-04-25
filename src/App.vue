<template>
  <div class="app-container">
    <div class="app-content">
      <div class="app-header card">
        <div class="header-inner">
          <router-link to="/" class="logo-link">
            <MapPin class="logo-icon" />
            <span class="logo-text">{{ $t('nav.title') }}</span>
          </router-link>
          <nav class="nav">
            <router-link to="/" class="nav-link">
              {{ $t('nav.home') }}
            </router-link>
            <button
              @click="toggleLocale"
              class="lang-btn"
            >
              {{ currentLocale === 'zh-CN' ? 'EN' : '中文' }}
            </button>
          </nav>
        </div>
      </div>

      <main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <div class="app-footer card">
        <div class="footer-inner">
          <p class="footer-text">
            {{ $t('nav.footer') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MapPin } from 'lucide-vue-next'

const { locale } = useI18n()

const currentLocale = computed(() => locale.value)

const toggleLocale = () => {
  const newLocale = locale.value === 'zh-CN' ? 'en' : 'zh-CN'
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
}
</script>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-image: url('https://haowallpaper.com/link/common/file/previewFileImg/15645687668576576');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.app-content {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: rgba(249, 250, 251, 0.1);
}

.app-header {
  margin: 16px;
  margin-bottom: 0;
  padding: 12px 16px;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .app-header {
    margin-left: 24px;
    margin-right: 24px;
  }
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0284c7;
  text-decoration: none;
}

.logo-icon {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  color: #4b5563;
  text-decoration: none;
  transition: color 150ms;
}

.nav-link:hover {
  color: #0284c7;
}

.lang-btn {
  padding: 4px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: background-color 150ms;
}

.lang-btn:hover {
  background-color: #f9fafb;
}

.app-main {
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 16px;
  overflow: auto;
}

.app-footer {
  margin: 0 16px 16px 16px;
  padding: 12px 16px;
  flex-shrink: 0;
  background-color: rgba(255, 255, 255, 0.5);
  
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  text-align: center;
}

.footer-text {
  color: #6b7280;
  font-size: 14px;
}
</style>
