<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <Info class="header-icon" />
          <h3 class="header-title">{{ $t('visitReminder.welcome') }}</h3>
        </div>

        <div class="reminder-list">
          <div class="reminder-item">
            <span class="item-icon blue">📅</span>
            <span class="item-text">{{ $t('visitReminder.cycle', { days: 3 }) }}</span>
          </div>
          <div class="reminder-item">
            <span class="item-icon green">📤</span>
            <span class="item-text">{{ $t('visitReminder.maxImages', { count: 10 }) }}</span>
          </div>
          <div class="reminder-item">
            <span class="item-icon yellow">⭐</span>
            <span class="item-text">{{ $t('visitReminder.topImages', { count: 2 }) }}</span>
          </div>
          <div class="reminder-item">
            <span class="item-icon red">🗑️</span>
            <span class="item-text">{{ $t('visitReminder.autoDelete') }}</span>
          </div>
          <div class="reminder-notice">
            <span class="notice-icon">🌐</span>
            <span class="notice-text">{{ $t('visitReminder.civilize') }}</span>
          </div>
        </div>

        <button @click="handleConfirm" class="btn btn-primary btn-full">
          {{ $t('visitReminder.understood') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { Info } from 'lucide-vue-next'

const emit = defineEmits(['close'])

const handleConfirm = () => {
  localStorage.setItem('visitedSpotCheckin', 'true')
  emit('close')
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal-content { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px); border-radius: 8px; max-width: 448px; width: 100%; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
.modal-header { text-align: center; margin-bottom: 16px; }
.header-icon { width: 48px; height: 48px; margin: 0 auto; color: #3b82f6; }
.header-title { font-size: 18px; font-weight: 700; margin-top: 12px; color: #111827; }
.reminder-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.reminder-item { display: flex; align-items: flex-start; gap: 8px; font-size: 14px; color: #4b5563; }
.item-icon { font-size: 16px; }
.item-icon.blue { color: #2563eb; }
.item-icon.green { color: #16a34a; }
.item-icon.yellow { color: #ca8a04; }
.item-icon.red { color: #dc2626; }
.reminder-notice { background: #fef9c3; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; display: flex; align-items: flex-start; gap: 8px; margin-top: 16px; }
.notice-icon { color: #a16207; }
.notice-text { font-size: 14px; color: #854d0e; }
.btn { padding: 12px 16px; font-size: 14px; font-weight: 500; border-radius: 8px; cursor: pointer; border: none; transition: all 150ms; }
.btn-full { width: 100%; }
.btn-primary { background: #0ea5e9; color: white; }
.btn-primary:hover { background: #0284c7; }
</style>
