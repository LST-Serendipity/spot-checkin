import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useReports() {
  const loading = ref(false)
  const reports = ref([])

  const fetchReports = async (status = null) => {
    loading.value = true
    try {
      let query = supabase
        .from('reports')
        .select(`
          *,
          images (
            id,
            url,
            spots (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error

      if (data && data.length > 0) {
        const commentIds = data
          .filter(r => r.comment_id)
          .map(r => r.comment_id)

        let commentsMap = {}
        if (commentIds.length > 0) {
          const { data: commentsData } = await supabase
            .from('ratings')
            .select('id, comment, score, visitor_name, image_id')
            .in('id', commentIds)

          if (commentsData) {
            commentsData.forEach(c => {
              commentsMap[c.id] = c
            })
          }
        }

        reports.value = data.map(r => ({
          ...r,
          ratings: commentsMap[r.comment_id] || null
        }))
      } else {
        reports.value = data || []
      }

      return reports.value
    } catch (error) {
      console.error('获取举报失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  const submitReport = async ({ imageId, reason, description, reportType = 'image', commentId = null }) => {
    loading.value = true
    try {
      const { data: existing } = await supabase
        .from('reports')
        .select('id')
        .eq('image_id', imageId)
        .eq('reporter_id', getReporterId())
        .eq('status', 'pending')
        .single()

      if (existing) {
        return { error: 'already_reported' }
      }

      const { error } = await supabase
        .from('reports')
        .insert({
          image_id: imageId,
          reason,
          description,
          reporter_id: getReporterId(),
          status: 'pending',
          report_type: reportType,
          comment_id: commentId
        })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('提交举报失败:', error)
      return { error: error.message }
    } finally {
      loading.value = false
    }
  }

  const updateReportStatus = async (reportId, status, action = null) => {
    loading.value = true
    try {
      const report = reports.value.find(r => r.id === reportId)
      if (!report) {
        throw new Error('Report not found')
      }

      if (action === 'delete' && status === 'resolved') {
        if (report.report_type === 'comment' && report.comment_id) {
          const { error: deleteRatingError } = await supabase
            .from('ratings')
            .delete()
            .eq('id', report.comment_id)

          if (deleteRatingError) {
            console.error('删除评论失败:', deleteRatingError)
            throw deleteRatingError
          }
        } else if (report.report_type === 'image' || report.image_id) {
          await supabase
            .from('ratings')
            .delete()
            .eq('image_id', report.image_id)

          const { data: imageData } = await supabase
            .from('images')
            .select('url')
            .eq('id', report.image_id)
            .single()

          if (imageData?.url) {
            const urlParts = imageData.url.split('/')
            const fileName = urlParts.slice(-2).join('/')
            await supabase.storage.from('spot-images').remove([fileName])
          }

          const { error: deleteImageError } = await supabase
            .from('images')
            .delete()
            .eq('id', report.image_id)

          if (deleteImageError) {
            console.error('删除图片失败:', deleteImageError)
            throw deleteImageError
          }
        }
      }

      const { error } = await supabase
        .from('reports')
        .update({
          status,
          processed_at: new Date().toISOString(),
          action
        })
        .eq('id', reportId)

      if (error) throw error

      await fetchReports()

      return { success: true }
    } catch (error) {
      console.error('更新举报状态失败:', error)
      return { error: error.message }
    } finally {
      loading.value = false
    }
  }

  const getReporterId = () => {
    let reporterId = localStorage.getItem('reporterId')
    if (!reporterId) {
      reporterId = 'user_' + Math.random().toString(36).substring(2, 15)
      localStorage.setItem('reporterId', reporterId)
    }
    return reporterId
  }

  const checkUserReported = async (imageId) => {
    const reporterId = getReporterId()
    const { data } = await supabase
      .from('reports')
      .select('id')
      .eq('image_id', imageId)
      .eq('reporter_id', reporterId)
      .eq('status', 'pending')
      .single()
    return !!data
  }

  return {
    loading,
    reports,
    fetchReports,
    submitReport,
    updateReportStatus,
    checkUserReported
  }
}
