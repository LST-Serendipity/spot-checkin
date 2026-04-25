import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useDatabaseUsage() {
  const usagePercent = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const fetchDatabaseUsage = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase.rpc('get_database_size_percent')

      if (err) {
        console.warn('无法获取数据库使用量，使用备用方案:', err.message)
        const estimate = await estimateStorageUsage()
        usagePercent.value = estimate
        loading.value = false
        return { percent: estimate, raw: null }
      }

      usagePercent.value = data || 0
      loading.value = false
      return { percent: data || 0, raw: data }
    } catch (err) {
      console.warn('获取数据库使用量失败:', err.message)
      const estimate = await estimateStorageUsage()
      usagePercent.value = estimate
      loading.value = false
      return { percent: estimate, raw: null }
    }
  }

  const estimateStorageUsage = async () => {
    try {
      const { count: imageCount } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true })

      const { count: spotCount } = await supabase
        .from('spots')
        .select('*', { count: 'exact', head: true })

      const { count: ratingCount } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true })

      const totalRecords = (imageCount || 0) + (spotCount || 0) + (ratingCount || 0)

      const estimatedPercent = Math.min(Math.round(totalRecords / 100), 95)

      return estimatedPercent
    } catch {
      return 0
    }
  }

  const canUpload = async () => {
    const { percent } = await fetchDatabaseUsage()
    return percent < 90
  }

  return {
    usagePercent,
    loading,
    error,
    fetchDatabaseUsage,
    canUpload
  }
}
