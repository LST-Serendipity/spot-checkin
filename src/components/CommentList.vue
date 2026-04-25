<template>
  <div class="comment-list">
    <div v-for="comment in comments" :key="comment.id" class="comment-item">
      <div class="comment-header">
        <div class="comment-author">
          <User class="author-icon" />
          <span class="author-name">{{ comment.visitor_name || $t('common.anonymous') }}</span>
        </div>
        <div class="comment-meta">
          <StarRating :model-value="comment.score" :readonly="true" />
          <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
          <button @click="$emit('report', comment)" class="report-btn" :title="$t('report.title')"><Flag class="report-icon" /></button>
        </div>
      </div>
      <p v-if="comment.comment" class="comment-text">{{ comment.comment }}</p>
    </div>
    <div v-if="comments.length === 0" class="no-comments">{{ $t('image.noComments') }}</div>
  </div>
</template>

<script setup>
import { User, Flag } from 'lucide-vue-next'
import StarRating from './StarRating.vue'

defineProps({ comments: { type: Array, default: () => [] } })
defineEmits(['report'])

const formatDate = (date) => { if (!date) return ''; return new Date(date).toLocaleDateString() }
</script>

<style scoped>
.comment-list { display: flex; flex-direction: column; gap: 12px; }
.comment-item { background: #f9fafb; border-radius: 8px; padding: 12px; }
.comment-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px; }
.comment-author { display: flex; align-items: center; gap: 8px; }
.author-icon { width: 16px; height: 16px; color: #9ca3af; }
.author-name { font-size: 14px; font-weight: 500; color: #374151; }
.comment-meta { display: flex; align-items: center; gap: 12px; }
.comment-date { font-size: 12px; color: #9ca3af; }
.report-btn { color: #fca5a5; background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; transition: color 150ms; }
.report-btn:hover { color: #dc2626; }
.report-icon { width: 16px; height: 16px; }
.comment-text { font-size: 14px; color: #4b5563; }
.no-comments { text-align: center; padding: 16px 0; color: #9ca3af; font-size: 14px; }
</style>
