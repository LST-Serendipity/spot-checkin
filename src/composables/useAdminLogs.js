import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useAdminLogs() {
  const loading = ref(false)
  const logs = ref([])

  const fetchLogs = async (limit = 100) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      logs.value = data || []
      return logs.value
    } catch (error) {
      console.error('获取操作日志失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  const addLog = async ({ action, target_type, target_id, details }) => {
    try {
      const { error } = await supabase
        .from('admin_logs')
        .insert({
          action,
          target_type,
          target_id,
          details,
          admin_key: localStorage.getItem('adminLoggedIn') ? 'admin' : 'unknown'
        })

      if (error) console.error('添加操作日志失败:', error)
    } catch (error) {
      console.error('添加操作日志失败:', error)
    }
  }

  const logActions = {
    createSpot: (spot) => addLog({
      action: 'create_spot',
      target_type: 'spot',
      target_id: spot.id,
      details: { name: spot.name }
    }),
    updateSpot: (spot) => addLog({
      action: 'update_spot',
      target_type: 'spot',
      target_id: spot.id,
      details: { name: spot.name }
    }),
    deleteSpot: (spot) => addLog({
      action: 'delete_spot',
      target_type: 'spot',
      target_id: spot.id,
      details: { name: spot.name }
    }),
    uploadImage: (image) => addLog({
      action: 'upload_image',
      target_type: 'image',
      target_id: image.id,
      details: { spot_id: image.spot_id }
    }),
    deleteImage: (image) => addLog({
      action: 'delete_image',
      target_type: 'image',
      target_id: image.id,
      details: {}
    }),
    addRating: (rating) => addLog({
      action: 'add_rating',
      target_type: 'rating',
      target_id: rating.id,
      details: { score: rating.score }
    }),
    deleteRating: (rating) => addLog({
      action: 'delete_rating',
      target_type: 'rating',
      target_id: rating.id,
      details: {}
    }),
    resolveReport: (report) => addLog({
      action: 'resolve_report',
      target_type: 'report',
      target_id: report.id,
      details: { image_id: report.image_id }
    }),
    rejectReport: (report) => addLog({
      action: 'reject_report',
      target_type: 'report',
      target_id: report.id,
      details: { image_id: report.image_id }
    })
  }

  return {
    loading,
    logs,
    fetchLogs,
    addLog,
    logActions
  }
}
