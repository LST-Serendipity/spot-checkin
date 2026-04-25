<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">{{ $t('admin.editSpot') }}</h3>

        <form @submit.prevent="handleSubmit" class="form">
          <div class="form-group">
            <label class="label">{{ $t('admin.nameLabel') }} *</label>
            <input v-model="form.name" type="text" required class="input" />
          </div>

          <div class="form-group">
            <label class="label">{{ $t('admin.locationLabel') }}</label>
            <input v-model="form.location" type="text" class="input" />
          </div>

          <div class="form-group">
            <label class="label">{{ $t('admin.descriptionLabel') }}</label>
            <textarea v-model="form.description" rows="3" class="input textarea" />
          </div>

          <div class="form-group">
            <label class="label">{{ $t('admin.coverImageLabel') }}</label>
            <input v-model="form.cover_image" type="url" class="input" />
            <div v-if="form.cover_image" class="image-preview">
              <img :src="form.cover_image" class="preview-img" @error="form.cover_image = ''" />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="emit('cancel')" class="btn btn-secondary">
              {{ $t('common.cancel') }}
            </button>
            <button type="submit" :disabled="submitting" class="btn btn-primary">
              {{ submitting ? $t('admin.saving') : $t('admin.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  spot: { type: Object, required: true }
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  name: '',
  location: '',
  description: '',
  cover_image: ''
})

const submitting = ref(false)

watch(() => props.spot, (newSpot) => {
  if (newSpot) {
    form.name = newSpot.name || ''
    form.location = newSpot.location || ''
    form.description = newSpot.description || ''
    form.cover_image = newSpot.cover_image || ''
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!form.name.trim()) return

  submitting.value = true
  emit('submit', {
    id: props.spot.id,
    name: form.name,
    location: form.location,
    description: form.description,
    cover_image: form.cover_image
  })
  submitting.value = false
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal-content { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px); border-radius: 8px; max-width: 448px; width: 100%; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
.modal-title { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px; }
.form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; }
.label { font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px; }
.input { width: 100%; padding: 8px 16px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; transition: border-color 150ms, box-shadow 150ms; }
.input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2); }
.textarea { resize: none; }
.image-preview { margin-top: 8px; }
.preview-img { width: 96px; height: 96px; object-fit: cover; border-radius: 4px; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 8px; }
.btn { padding: 8px 16px; font-size: 14px; font-weight: 500; border-radius: 8px; cursor: pointer; border: none; transition: all 150ms; }
.btn-primary { background: #0ea5e9; color: white; }
.btn-primary:hover { background: #0284c7; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: white; color: #374151; border: 1px solid #d1d5db; }
.btn-secondary:hover { background: #f9fafb; }
</style>
