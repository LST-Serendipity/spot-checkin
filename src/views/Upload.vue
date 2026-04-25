<template>
  <div class="upload-page">
    <div class="back-link">
      <router-link :to="`/spots/${spotId}`" class="link">
        <ArrowLeft class="link-icon" />
        {{ $t('upload.back') }}
      </router-link>
    </div>

    <div class="form-card">
      <h1 class="form-title">{{ $t('upload.title') }}</h1>

      <div v-if="databaseFull" class="alert alert-error">
        <div class="alert-header">
          <Database class="alert-icon" />
          <span class="alert-title">{{ $t('upload.storageFull') }}</span>
        </div>
        <p class="alert-desc">{{ $t('upload.storageFullDesc', { percent: dbUsagePercent }) }}</p>
      </div>

      <div v-else-if="!canUpload" class="alert alert-warning">
        <div class="alert-header">
          <AlertCircle class="alert-icon" />
          <span class="alert-title">{{ $t('upload.uploadClosed') }}</span>
        </div>
        <p class="alert-desc">{{ $t('spot.cycleRemaining') }}：{{ timeLeft.days }}天 {{ timeLeft.hours }}时 {{ timeLeft.minutes }}分</p>
      </div>

      <div v-else-if="imagesCount >= maxImages" class="alert alert-warning">
        <div class="alert-header">
          <AlertCircle class="alert-icon" />
          <span class="alert-title">{{ $t('upload.uploadLimit') }}</span>
        </div>
      </div>

      <div v-else>
        <div class="info-box">
          <p class="info-text"><span class="font-medium">{{ $t('upload.remaining', { count: maxImages - imagesCount }) }}</span></p>
        </div>

        <UploadZone :disabled="uploading" :max-files="maxImages - imagesCount" @upload="handleUpload" />

        <div v-if="uploading" class="progress-section">
          <div class="progress-info">
            <Loader2 v-if="compressing" class="progress-icon spin" />
            <Image v-else class="progress-icon" />
            {{ compressing ? $t('upload.compressing') : $t('upload.uploading') }} {{ uploadProgress }}%
          </div>
          <div class="progress-bar"><div class="progress-fill" :style="{ width: `${uploadProgress}%` }" /></div>
          <div v-if="savedSize > 0" class="saved-info">{{ $t('upload.saved', { size: formatBytes(savedSize) }) }}</div>
        </div>
      </div>

      <div v-if="uploadedFiles.length > 0" class="uploaded-section">
        <h3 class="uploaded-title">{{ $t('upload.uploaded') }} ({{ uploadedFiles.length }})</h3>
        <div class="uploaded-list">
          <div v-for="file in uploadedFiles" :key="file.name" class="uploaded-item">
            <CheckCircle class="uploaded-icon" />
            <span class="uploaded-name">{{ file.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, AlertCircle, Loader2, CheckCircle, Image, Database } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useCycle } from '@/composables/useCycle'
import { useImages } from '@/composables/useImages'
import { useDatabaseUsage } from '@/composables/useDatabaseUsage'
import { compressImage } from '@/composables/useImageCompression'
import UploadZone from '@/components/UploadZone.vue'

const route = useRoute()
const spotId = route.params.id
const { getCurrentCycleInfo, getCycleStart, MAX_IMAGES_PER_SPOT, isInUploadWindow } = useCycle()
const { uploadImage, uploadProgress } = useImages()
const { usagePercent: dbUsagePercent, fetchDatabaseUsage } = useDatabaseUsage()

const canUpload = ref(false)
const databaseFull = ref(false)
const uploading = ref(false)
const compressing = ref(false)
const uploadedFiles = ref([])
const imagesCount = ref(0)
const maxImages = MAX_IMAGES_PER_SPOT
const originalSize = ref(0)
const compressedSize = ref(0)

const cycleInfo = computed(() => getCurrentCycleInfo())
const timeLeft = computed(() => cycleInfo.value.timeLeft)
const savedSize = computed(() => { const saved = originalSize.value - compressedSize.value; return saved > 0 ? saved : 0 })

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const checkCanUpload = async () => {
  const dbResult = await fetchDatabaseUsage()
  databaseFull.value = dbResult.percent >= 90
  const currentCycleStart = getCycleStart()
  canUpload.value = isInUploadWindow(currentCycleStart) && !databaseFull.value
  const { count } = await supabase.from('images').select('*', { count: 'exact', head: true }).eq('spot_id', spotId).eq('is_kept', false)
  imagesCount.value = count || 0
}

const handleUpload = async (files) => {
  uploading.value = true
  compressing.value = true
  uploadedFiles.value = []
  originalSize.value = 0
  compressedSize.value = 0
  const cycleStart = cycleInfo.value.cycleStart.toISOString()
  for (const file of files) {
    try {
      originalSize.value += file.size
      const compressed = await compressImage(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, quality: 0.85 })
      compressedSize.value += compressed.size
      const newImage = await uploadImage(spotId, compressed, cycleStart)
      uploadedFiles.value.push(file)
      imagesCount.value++
      if (newImage?.url) {
        await supabase.from('spots').update({ cover_image: newImage.url }).eq('id', spotId)
      }
    } catch (err) {
      alert(`Upload ${file.name} failed`)
    }
  }
  compressing.value = false
  uploading.value = false
}

onMounted(checkCanUpload)
</script>

<style scoped>
.upload-page { max-width: 672px; margin: 0 auto; }
.back-link { margin-bottom: 24px; }
.link { display: inline-flex; align-items: center; gap: 4px; color: #0ea5e9; text-decoration: none; }
.link:hover { text-decoration: underline; }
.link-icon { width: 16px; height: 16px; }
.form-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px); border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.form-title { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 16px; }

.alert { border-radius: 8px; padding: 16px; margin-bottom: 24px; }
.alert-error { background: #fef2f2; border: 1px solid #fecaca; }
.alert-warning { background: #fefce8; border: 1px solid #fef08a; }
.alert-header { display: flex; align-items: center; gap: 8px; }
.alert-error .alert-header { color: #991b1b; }
.alert-warning .alert-header { color: #854d0e; }
.alert-icon { width: 20px; height: 20px; }
.alert-title { font-weight: 500; }
.alert-error .alert-desc { font-size: 14px; color: #dc2626; margin-top: 4px; }
.alert-warning .alert-desc { font-size: 14px; color: #ca8a04; margin-top: 4px; }

.info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
.info-text { font-size: 14px; color: #1d4ed8; }

.progress-section { margin-top: 16px; }
.progress-info { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #4b5563; margin-bottom: 8px; }
.progress-icon { width: 16px; height: 16px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.progress-bar { width: 100%; height: 8px; background: #e5e7eb; border-radius: 9999px; overflow: hidden; }
.progress-fill { height: 100%; background: #0ea5e9; transition: width 300ms; }
.saved-info { font-size: 12px; color: #16a34a; margin-top: 8px; }

.uploaded-section { margin-top: 24px; }
.uploaded-title { font-weight: 500; color: #111827; margin-bottom: 12px; }
.uploaded-list { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
@media (max-width: 768px) { .uploaded-list { grid-template-columns: repeat(2, 1fr); } }
.uploaded-item { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px; }
.uploaded-icon { width: 16px; height: 16px; color: #22c55e; }
.uploaded-name { font-size: 14px; color: #15803d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
