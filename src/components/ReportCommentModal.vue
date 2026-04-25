<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="emit('update:modelValue', false)">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ $t('report.commentTitle') }}</h3>
          <button @click="emit('update:modelValue', false)" class="close-btn">
            <X class="close-icon" />
          </button>
        </div>

        <div v-if="comment" class="comment-preview">
          <div class="comment-author">
            <User class="author-icon" />
            <span class="author-name">{{ comment.visitor_name || $t('common.anonymous') }}</span>
          </div>
          <p class="comment-text">{{ comment.comment }}</p>
        </div>

        <div v-if="!submitted">
          <div class="form-group">
            <label class="label">{{ $t('report.reason') }} *</label>
            <select v-model="reason" class="input">
              <option value="">{{ $t('report.reasonPlaceholder') }}</option>
              <option value="inappropriate">{{ $t('report.reasons.inappropriate') }}</option>
              <option value="spam">{{ $t('report.reasons.spam') }}</option>
              <option value="harassment">{{ $t('report.reasons.harassment') }}</option>
              <option value="other">{{ $t('report.reasons.other') }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label">{{ $t('report.description') }}</label>
            <textarea v-model="description" rows="3" class="input textarea" :placeholder="$t('report.descriptionPlaceholder')" />
          </div>

          <button @click="handleSubmit" :disabled="!reason || submitting" class="btn btn-danger btn-full">
            {{ submitting ? $t('report.submitting') : $t('report.submit') }}
          </button>
        </div>

        <div v-else class="success-state">
          <CheckCircle class="success-icon" />
          <p class="success-text">{{ $t('report.success') }}</p>
          <button @click="emit('update:modelValue', false)" class="btn btn-primary">
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { X, CheckCircle, User } from 'lucide-vue-next'
import { useReports } from '@/composables/useReports'

const props = defineProps({
  modelValue: Boolean,
  comment: Object
})

const emit = defineEmits(['update:modelValue', 'submit'])

const { submitReport, loading: submitting } = useReports()

const reason = ref('')
const description = ref('')
const submitted = ref(false)

const handleSubmit = async () => {
  if (!reason.value) return

  const result = await submitReport({
    imageId: props.comment.image_id,
    reason: reason.value,
    description: description.value,
    reportType: 'comment',
    commentId: props.comment.id
  })

  if (result.success) {
    submitted.value = true
    emit('submit', { reason: reason.value, description: description.value })
  } else if (result.error === 'already_reported') {
    alert($t('report.alreadyReported'))
  } else {
    alert($t('report.error'))
  }
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 70; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal-content { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px); border-radius: 8px; max-width: 448px; width: 100%; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-title { font-size: 18px; font-weight: 600; color: #111827; }
.close-btn { color: #6b7280; background: none; border: none; cursor: pointer; padding: 4px; transition: color 150ms; }
.close-btn:hover { color: #374151; }
.close-icon { width: 20px; height: 20px; }
.comment-preview { background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
.comment-author { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.author-icon { width: 16px; height: 16px; color: #9ca3af; }
.author-name { font-size: 14px; font-weight: 500; color: #374151; }
.comment-text { font-size: 14px; color: #4b5563; }
.form-group { margin-bottom: 16px; }
.label { display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px; }
.input { width: 100%; padding: 8px 16px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; transition: border-color 150ms, box-shadow 150ms; }
.input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2); }
.textarea { resize: none; }
.btn { padding: 8px 16px; font-size: 14px; font-weight: 500; border-radius: 8px; cursor: pointer; border: none; transition: all 150ms; }
.btn-full { width: 100%; }
.btn-danger { background: #ef4444; color: white; }
.btn-danger:hover { background: #dc2626; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: #0ea5e9; color: white; }
.btn-primary:hover { background: #0284c7; }
.success-state { text-align: center; padding: 16px 0; }
.success-icon { width: 64px; height: 64px; margin: 0 auto; color: #22c55e; }
.success-text { font-size: 18px; font-weight: 500; color: #111827; margin: 16px 0; }
</style>
