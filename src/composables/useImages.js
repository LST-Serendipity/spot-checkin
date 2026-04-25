import { ref } from 'vue'
import { supabase, STORAGE_URL } from '@/lib/supabase'

export function useImages() {
  const images = ref([])
  const loading = ref(false)
  const error = ref(null)
  const uploadProgress = ref(0)

  const fetchImagesBySpot = async (spotId, includeKept = true) => {
    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from('images')
        .select(`
          *,
          ratings(score, comment, created_at)
        `)
        .eq('spot_id', spotId)
        .order('created_at', { ascending: false })

      if (!includeKept) {
        query = query.eq('is_kept', false)
      }

      const { data, error: err } = await query

      if (err) {
        console.error('获取图片失败:', err)
        throw err
      }

      console.log('获取到的图片数据:', data)
      images.value = data || []
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const uploadImage = async (spotId, file, cycleStart) => {
    uploadProgress.value = 0
    const fileExt = file.name.split('.').pop()
    const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const fileName = `${spotId}/${safeFileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('spot-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    uploadProgress.value = 50

    const publicUrl = `${STORAGE_URL}/storage/v1/object/public/spot-images/${fileName}`

    const { data: imageData, error: dbError } = await supabase
      .from('images')
      .insert([
        {
          spot_id: spotId,
          url: publicUrl,
          cycle_start: cycleStart,
          is_kept: false,
          total_score: 0,
          rating_count: 0
        }
      ])
      .select()
      .single()

    if (dbError) throw dbError

    uploadProgress.value = 100
    return imageData
  }

  const deleteImage = async (imageId) => {
    const { data: image } = await supabase
      .from('images')
      .select('url')
      .eq('id', imageId)
      .single()

    if (image) {
      const urlParts = image.url.split('/')
      const fileName = urlParts.slice(-2).join('/')

      await supabase.storage
        .from('spot-images')
        .remove([fileName])
    }

    const { error: err } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId)

    if (err) throw err
  }

  return {
    images,
    loading,
    error,
    uploadProgress,
    fetchImagesBySpot,
    uploadImage,
    deleteImage
  }
}
