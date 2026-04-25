import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useRatings() {
  const loading = ref(false)
  const error = ref(null)

  const addRating = async (imageId, score, comment = '') => {
    loading.value = true
    error.value = null
    try {
      console.log('开始评分:', { imageId, score, comment })

      const { data, error: err } = await supabase
        .from('ratings')
        .insert([
          {
            image_id: imageId,
            score,
            comment
          }
        ])
        .select()
        .single()

      if (err) {
        console.error('评分保存失败:', err)
        throw err
      }

      console.log('评分已保存:', data)

      await updateImageScore(imageId)

      return data
    } catch (err) {
      error.value = err.message
      console.error('评分错误:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateImageScore = async (imageId) => {
    console.log('更新图片评分:', imageId)

    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('score')
      .eq('image_id', imageId)

    if (ratingsError) {
      console.error('获取评分失败:', ratingsError)
      return
    }

    console.log('获取到的评分:', ratings)

    if (ratings && ratings.length > 0) {
      const totalScore = ratings.reduce((sum, r) => sum + r.score, 0)

      console.log('更新图片总分:', totalScore, '数量:', ratings.length)

      const { error: updateError } = await supabase
        .from('images')
        .update({
          total_score: totalScore,
          rating_count: ratings.length
        })
        .eq('id', imageId)

      if (updateError) {
        console.error('更新图片评分失败:', updateError)
      } else {
        console.log('图片评分更新成功')
      }
    }
  }

  const getRatingsByImage = async (imageId) => {
    const { data, error: err } = await supabase
      .from('ratings')
      .select('*')
      .eq('image_id', imageId)
      .order('created_at', { ascending: false })

    if (err) throw err
    return data
  }

  return {
    loading,
    error,
    addRating,
    getRatingsByImage
  }
}
