<template>
  <Teleport to="body">
    <div v-if="image" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ $t('image.details') }}</h3>
          <div class="modal-actions">
            <button @click="showReportModal = true" class="action-btn report"><Flag class="action-icon" /></button>
            <button @click="emit('close')" class="action-btn close"><X class="action-icon" /></button>
          </div>
        </div>

        <div class="modal-body">
          <div class="image-section">
            <img :src="image.url" :alt="`Image ${image.id}`" class="modal-image" @click="openLightbox" />
          </div>

          <div class="info-section">
            <div class="rating-info">
              <span class="rating-text">{{ $t('image.rating') }}：{{ displayRating }}</span>
              <span v-if="image.is_kept" class="kept-badge">{{ $t('image.permanent') }}</span>
            </div>

            <div v-if="!image.is_kept" class="rating-form">
              <p class="form-title">{{ $t('image.rateThis') }}</p>
              <StarRating v-model="newRating.score" />
              <textarea v-model="newRating.comment" :placeholder="$t('image.commentPlaceholder')" class="comment-input" rows="3" />
              <button @click="submitRating" :disabled="!newRating.score || submitting" class="btn btn-primary">
                {{ submitting ? $t('image.submitting') : $t('image.submitRating') }}
              </button>
            </div>

            <div class="comments-section">
              <h4 class="comments-title">{{ $t('image.comments') }} ({{ comments.length }})</h4>
              <CommentList :comments="comments" @report="handleReportComment" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <ImageLightbox v-if="lightboxImages.length > 0" v-model="lightboxOpen" :images="lightboxImages" :initial-index="lightboxInitialIndex" />
    <ReportModal v-if="showReportModal && image" v-model="showReportModal" :image-id="image.id" :image-url="image.url" />
    <ReportCommentModal v-if="showCommentReportModal" v-model="showCommentReportModal" :comment="selectedComment" @submit="submitCommentReport" />
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { X, Flag } from 'lucide-vue-next'
import { useRatings } from '@/composables/useRatings'
import StarRating from './StarRating.vue'
import CommentList from './CommentList.vue'
import ImageLightbox from './ImageLightbox.vue'
import ReportModal from './ReportModal.vue'
import ReportCommentModal from './ReportCommentModal.vue'

const { t } = useI18n()

const props = defineProps({
  image: { type: Object, default: null },
  comments: { type: Array, default: () => [] },
  allImages: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'rate'])
const { loading: submitting } = useRatings()

const lightboxOpen = ref(false)
const lightboxImages = ref([])
const lightboxInitialIndex = ref(0)
const showReportModal = ref(false)
const showCommentReportModal = ref(false)
const selectedComment = ref(null)

const newRating = reactive({ score: 0, comment: '' })

const displayRating = computed(() => {
  const ratings = props.comments || []
  if (ratings.length === 0) return t('image.rating')
  const total = ratings.reduce((sum, r) => sum + r.score, 0)
  const avg = (total / ratings.length).toFixed(1)
  return `${avg} (${ratings.length})`
})

const openLightbox = () => {
  if (props.allImages.length > 0) {
    lightboxImages.value = props.allImages
    const idx = props.allImages.findIndex(img => img.id === props.image.id)
    lightboxInitialIndex.value = idx >= 0 ? idx : 0
  } else {
    lightboxImages.value = props.image ? [props.image] : []
    lightboxInitialIndex.value = 0
  }
  lightboxOpen.value = true
}

const submitRating = async () => {
  if (!newRating.score) return
  emit('rate', { score: newRating.score, comment: newRating.comment })
  newRating.score = 0
  newRating.comment = ''
}

const handleReportComment = (comment) => { selectedComment.value = comment; showCommentReportModal.value = true }
const submitCommentReport = async (data) => { console.log('Submit comment report:', data); showCommentReportModal.value = false }
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); z-index: 60; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal-content { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px); border-radius: 8px; max-width: 896px; width: 100%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; }
.modal-title { font-weight: 600; color: #111827; }
.modal-actions { display: flex; gap: 8px; }
.action-btn { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; }
.action-btn.report { color: #ef4444; }
.action-btn.report:hover { color: #dc2626; }
.action-btn.close { color: #6b7280; }
.action-btn.close:hover { color: #374151; }
.action-icon { width: 24px; height: 24px; }
.modal-body { flex: 1; overflow-y: auto; min-height: 0; }
.image-section { padding: 16px; display: flex; justify-content: center; }
.modal-image { max-width: 100%; max-height: 50vh; object-fit: contain; border-radius: 8px; cursor: pointer; transition: opacity 150ms; }
.modal-image:hover { opacity: 0.9; }
.info-section { border-top: 1px solid #e5e7eb; padding: 16px; }
.rating-info { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.rating-text { font-size: 14px; color: #6b7280; }
.kept-badge { background: #fef9c3; color: #a16207; font-size: 12px; padding: 4px 12px; border-radius: 9999px; }
.rating-form { background: #f9fafb; border-radius: 8px; padding: 16px; }
.form-title { font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 12px; }
.comment-input { width: 100%; padding: 12px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 8px; resize: none; margin-top: 12px; outline: none; }
.comment-input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2); }
.btn { padding: 8px 16px; font-size: 14px; font-weight: 500; border-radius: 8px; cursor: pointer; border: none; transition: all 150ms; margin-top: 12px; }
.btn-primary { background: #0ea5e9; color: white; }
.btn-primary:hover { background: #0284c7; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.comments-section { margin-top: 24px; }
.comments-title { font-weight: 500; color: #111827; margin-bottom: 12px; }
</style>
