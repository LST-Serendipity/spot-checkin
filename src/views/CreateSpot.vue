<template>
  <div class="create-spot">
    <div class="back-link">
      <router-link to="/" class="link">
        <ArrowLeft class="link-icon" />
        {{ $t('common.back') }}
      </router-link>
    </div>

    <div class="form-card">
      <h1 class="form-title">{{ $t('create.title') }}</h1>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label class="label">
            {{ $t('create.name') }} {{ $t('create.required') }}
          </label>
          <input v-model="form.name" type="text" required class="input" :placeholder="$t('create.namePlaceholder')" />
        </div>

        <div class="form-group">
          <label class="label">{{ $t('create.location') }}</label>
          <input v-model="form.location" type="text" class="input" :placeholder="$t('create.locationPlaceholder')" />
        </div>

        <div class="form-group">
          <label class="label">{{ $t('create.description') }}</label>
          <textarea v-model="form.description" rows="4" class="input textarea" :placeholder="$t('create.descPlaceholder')" />
        </div>

        <div class="form-group">
          <label class="label">{{ $t('create.coverImage') }}</label>
          <input v-model="form.cover_image" type="url" class="input" :placeholder="$t('create.coverImagePlaceholder')" />
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="submitting" class="btn btn-primary">
            {{ submitting ? $t('create.creating') : $t('create.createSpot') }}
          </button>
          <router-link to="/" class="btn btn-secondary">{{ $t('common.cancel') }}</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useSpotsStore } from '@/stores/spots'
import { useCycle } from '@/composables/useCycle'

const router = useRouter()
const spotsStore = useSpotsStore()
const { getCycleStart } = useCycle()

const submitting = ref(false)

const form = reactive({
  name: '',
  location: '',
  description: '',
  cover_image: ''
})

const handleSubmit = async () => {
  if (!form.name.trim()) return
  submitting.value = true
  try {
    const spotData = { ...form, current_cycle_start: getCycleStart().toISOString() }
    const newSpot = await spotsStore.addSpot(spotData)
    router.push(`/spots/${newSpot.id}`)
  } catch (err) {
    alert($t('create.error') || 'Failed to create spot')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-spot { max-width: 672px; margin: 0 auto; }

.back-link { margin-bottom: 24px; }
.link { display: inline-flex; align-items: center; gap: 4px; color: #0ea5e9; text-decoration: none; }
.link:hover { text-decoration: underline; }
.link-icon { width: 16px; height: 16px; }

.form-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px); border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.form-title { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 24px; }

.form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; }
.label { font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px; }
.input { width: 100%; padding: 8px 16px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; transition: border-color 150ms, box-shadow 150ms; }
.input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2); }
.textarea { resize: none; }

.form-actions { display: flex; gap: 16px; padding-top: 16px; }
.btn { padding: 8px 16px; font-size: 14px; font-weight: 500; border-radius: 8px; cursor: pointer; border: none; transition: all 150ms; text-decoration: none; }
.btn-primary { background: #0ea5e9; color: white; flex: 1; }
.btn-primary:hover { background: #0284c7; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: white; color: #374151; border: 1px solid #d1d5db; }
.btn-secondary:hover { background: #f9fafb; }
</style>
