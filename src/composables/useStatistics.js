import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useStatistics() {
  const loading = ref(false)

  const fetchOverview = async () => {
    loading.value = true
    try {
      const [
        spotsRes,
        imagesRes,
        ratingsRes,
        reportsRes
      ] = await Promise.all([
        supabase.from('spots').select('*', { count: 'exact' }),
        supabase.from('images').select('*', { count: 'exact' }),
        supabase.from('ratings').select('*', { count: 'exact' }),
        supabase.from('reports').select('*', { count: 'exact' }).eq('status', 'pending')
      ])

      const avgRatingRes = await supabase
        .from('ratings')
        .select('score')

      let avgRating = 0
      if (avgRatingRes.data && avgRatingRes.data.length > 0) {
        const total = avgRatingRes.data.reduce((sum, r) => sum + r.score, 0)
        avgRating = (total / avgRatingRes.data.length).toFixed(1)
      }

      return {
        totalSpots: spotsRes.count || 0,
        totalImages: imagesRes.count || 0,
        totalRatings: ratingsRes.count || 0,
        pendingReports: reportsRes.count || 0,
        avgRating
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      return {
        totalSpots: 0,
        totalImages: 0,
        totalRatings: 0,
        pendingReports: 0,
        avgRating: 0
      }
    } finally {
      loading.value = false
    }
  }

  const fetchImagesPerDay = async (days = 7) => {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      startDate.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('images')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      const counts = {}
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const key = date.toISOString().split('T')[0]
        counts[key] = 0
      }

      data?.forEach(img => {
        const key = img.created_at.split('T')[0]
        if (counts[key] !== undefined) {
          counts[key]++
        }
      })

      return Object.entries(counts).map(([date, count]) => ({ date, count }))
    } catch (error) {
      console.error('获取每日图片统计失败:', error)
      return []
    }
  }

  const fetchRatingsPerDay = async (days = 7) => {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      startDate.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('ratings')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      const counts = {}
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const key = date.toISOString().split('T')[0]
        counts[key] = 0
      }

      data?.forEach(rating => {
        const key = rating.created_at.split('T')[0]
        if (counts[key] !== undefined) {
          counts[key]++
        }
      })

      return Object.entries(counts).map(([date, count]) => ({ date, count }))
    } catch (error) {
      console.error('获取每日评分统计失败:', error)
      return []
    }
  }

  const fetchTopSpots = async (limit = 5) => {
    try {
      const { data, error } = await supabase
        .from('spots')
        .select(`
          *,
          images (
            id
          )
        `)

      if (error) throw error

      const spotsWithCount = (data || []).map(spot => ({
        ...spot,
        imageCount: spot.images?.length || 0
      }))

      spotsWithCount.sort((a, b) => b.imageCount - a.imageCount)

      return spotsWithCount.slice(0, limit)
    } catch (error) {
      console.error('获取热门景点失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchRecentActivity = async (limit = 10) => {
    try {
      const [
        recentImages,
        recentRatings
      ] = await Promise.all([
        supabase
          .from('images')
          .select('id, created_at, spots(name)')
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('ratings')
          .select('id, score, created_at, images(spot_id)')
          .order('created_at', { ascending: false })
          .limit(limit)
      ])

      const activities = []

      recentImages.data?.forEach(img => {
        activities.push({
          type: 'image',
          id: img.id,
          date: img.created_at,
          description: `上传图片到 ${img.spots?.name || '未知景点'}`
        })
      })

      recentRatings.data?.forEach(rating => {
        activities.push({
          type: 'rating',
          id: rating.id,
          date: rating.created_at,
          description: `评分 ${rating.score} 星`
        })
      })

      activities.sort((a, b) => new Date(b.date) - new Date(a.date))

      return activities.slice(0, limit)
    } catch (error) {
      console.error('获取近期活动失败:', error)
      return []
    }
  }

  return {
    loading,
    fetchOverview,
    fetchImagesPerDay,
    fetchRatingsPerDay,
    fetchTopSpots,
    fetchRecentActivity
  }
}
