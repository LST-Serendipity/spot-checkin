<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-actions">
          <button @click="emit('cancel')" class="btn btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="emit('confirm')" class="btn btn-danger">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({ title: String, message: String })
const emit = defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal-content { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px); border-radius: 8px; max-width: 448px; width: 100%; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
.modal-title { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px; }
.modal-message { color: #4b5563; margin-bottom: 24px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
.btn { padding: 8px 16px; font-size: 14px; font-weight: 500; border-radius: 8px; cursor: pointer; border: none; transition: all 150ms; }
.btn-secondary { background: white; color: #374151; border: 1px solid #d1d5db; }
.btn-secondary:hover { background: #f9fafb; }
.btn-danger { background: #ef4444; color: white; }
.btn-danger:hover { background: #dc2626; }
</style>
