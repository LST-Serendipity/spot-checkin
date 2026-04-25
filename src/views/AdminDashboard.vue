<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <div class="admin-header-inner">
        <div class="admin-title">
          <Shield class="admin-icon" />
          <span>{{ $t('admin.title') }}</span>
        </div>
        <button @click="handleLogout" class="logout-btn">
          <LogOut class="logout-icon" />
          {{ $t('admin.logout') }}
        </button>
      </div>
    </div>

    <main class="admin-main">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
        >
          {{ tab.label }}
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </button>
      </div>

      <div v-if="activeTab === 'overview'">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon blue">
              <MapPin class="stat-icon-inner" />
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.totalSpots }}</p>
              <p class="stat-label">{{ $t('admin.totalSpots') }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">
              <ImageIcon class="stat-icon-inner" />
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.totalImages }}</p>
              <p class="stat-label">{{ $t('admin.totalImages') }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon yellow">
              <Star class="stat-icon-inner" />
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.totalRatings }}</p>
              <p class="stat-label">{{ $t('admin.totalRatings') }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon purple">
              <Database class="stat-icon-inner" />
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ dbUsagePercent }}%</p>
              <p class="stat-label">{{ $t('admin.storageUsage') }}</p>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :class="{
                    'bg-red-500': dbUsagePercent >= 90,
                    'bg-yellow-500': dbUsagePercent >= 70 && dbUsagePercent < 90,
                    'bg-green-500': dbUsagePercent < 70
                  }"
                  :style="{ width: `${Math.min(dbUsagePercent, 100)}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <h3 class="chart-title">{{ $t('admin.imagesPerDay') }}</h3>
            <div class="chart-bars">
              <div
                v-for="(item, idx) in imagesPerDay"
                :key="idx"
                class="chart-bar primary"
                :style="{ height: `${Math.max(item.count * 10, 4)}px` }"
                :title="`${item.date}: ${item.count}`"
              />
            </div>
          </div>
          <div class="chart-card">
            <h3 class="chart-title">{{ $t('admin.ratingsPerDay') }}</h3>
            <div class="chart-bars">
              <div
                v-for="(item, idx) in ratingsPerDay"
                :key="idx"
                class="chart-bar yellow"
                :style="{ height: `${Math.max(item.count * 20, 4)}px` }"
                :title="`${item.date}: ${item.count}`"
              />
            </div>
          </div>
        </div>

        <div class="lists-grid">
          <div class="list-card">
            <h3 class="list-title">{{ $t('admin.topSpots') }}</h3>
            <div class="list-items">
              <div v-for="(spot, idx) in topSpots" :key="spot.id" class="list-item">
                <div class="list-item-left">
                  <span class="rank">{{ idx + 1 }}</span>
                  <span class="name">{{ spot.name }}</span>
                </div>
                <span class="count">{{ spot.imageCount }} {{ $t('admin.totalImages').toLowerCase() }}</span>
              </div>
              <div v-if="topSpots.length === 0" class="no-data">{{ $t('common.noData') }}</div>
            </div>
          </div>
          <div class="list-card">
            <h3 class="list-title">{{ $t('admin.recentActivity') }}</h3>
            <div class="list-items">
              <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
                <div class="activity-dot" :class="activity.type === 'image' ? 'green' : 'yellow'" />
                <span class="activity-desc">{{ activity.description }}</span>
                <span class="activity-date">{{ formatDate(activity.date) }}</span>
              </div>
              <div v-if="recentActivity.length === 0" class="no-data">{{ $t('common.noData') }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'spots'">
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">{{ $t('admin.spotManagement') }}</h2>
            <router-link to="/create-spot" class="btn btn-primary">
              <Plus class="btn-icon" />
              {{ $t('admin.addSpot') }}
            </router-link>
          </div>

          <div v-if="loading" class="loading">
            <Loader2 class="loading-icon spin" />
          </div>

          <div v-else class="list">
            <div v-for="spot in spots" :key="spot.id" class="list-row">
              <div class="spot-info">
                <img v-if="spot.cover_image" :src="spot.cover_image" class="spot-img" />
                <div v-else class="spot-img placeholder"><ImageIcon /></div>
                <div>
                  <h3 class="spot-name">{{ spot.name }}</h3>
                  <p class="spot-location">{{ spot.location || '无位置' }}</p>
                  <p class="spot-stats">{{ spot.image_count || 0 }} 张图片 · {{ spot.rating_count || 0 }} 次评分</p>
                </div>
              </div>
              <div class="actions">
                <router-link :to="`/spots/${spot.id}`" class="action-btn" :title="$t('admin.view')"><Eye /></router-link>
                <button @click="openEditModal(spot)" class="action-btn" :title="$t('admin.edit')"><Edit /></button>
                <button @click="confirmDeleteSpot(spot)" class="action-btn danger" :title="$t('common.delete')"><Trash2 /></button>
              </div>
            </div>
            <div v-if="spots.length === 0" class="no-data-panel">{{ $t('admin.noSpots') }}</div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'reports'">
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">{{ $t('admin.reportSystem') }}</h2>
            <div class="filters">
              <button
                v-for="filter in reportFilters"
                :key="filter.value"
                @click="reportFilter = filter.value"
                class="filter-btn"
                :class="{ active: reportFilter === filter.value }"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>

          <div v-if="loadingReports" class="loading">
            <Loader2 class="loading-icon spin" />
          </div>

          <div v-else-if="filteredReports.length === 0" class="no-data-panel">{{ $t('admin.noReports') }}</div>

          <div v-else class="list">
            <div v-for="report in filteredReports" :key="report.id" class="report-item">
              <div class="report-content">
                <div class="report-image">
                  <img v-if="report.report_type === 'image' || !report.report_type" :src="report.images?.url" />
                  <div v-else class="report-image-placeholder"><ImageIcon /></div>
                </div>
                <div class="report-details">
                  <div class="report-badges">
                    <span class="badge" :class="report.report_type === 'comment' ? 'badge-blue' : 'badge-orange'">
                      {{ report.report_type === 'comment' ? $t('admin.reportTypeComment') : $t('admin.reportTypeImage') }}
                    </span>
                    <span class="badge" :class="`badge-${getReasonColor(report.reason)}`">{{ getReasonLabel(report.reason) }}</span>
                    <span class="badge" :class="`badge-status-${report.status}`">{{ getStatusLabel(report.status) }}</span>
                  </div>
                  <p class="report-spot"><span class="font-medium">{{ report.images?.spots?.name }}</span></p>
                  <div v-if="report.report_type === 'comment' && report.ratings" class="report-comment">
                    <span class="comment-author">{{ report.ratings?.visitor_name || $t('common.anonymous') }}</span>
                    <div class="comment-stars">
                      <Star v-for="s in 5" :key="s" class="star" :class="s <= (report.ratings?.score || 0) ? 'filled' : ''" />
                    </div>
                    <p class="comment-text">{{ report.ratings?.comment || $t('image.noComments') }}</p>
                  </div>
                  <p v-if="report.description" class="report-desc">"{{ report.description }}"</p>
                  <p class="report-date">{{ formatDate(report.created_at) }}</p>
                </div>
              </div>
              <div v-if="report.status === 'pending'" class="report-actions">
                <button @click="handleReportAction(report, 'resolved', 'delete')" class="btn btn-danger btn-sm">
                  {{ $t('admin.deleteContent') }}
                </button>
                <button @click="handleReportAction(report, 'resolved', 'reject')" class="btn btn-success btn-sm">
                  {{ $t('admin.dismiss') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'logs'">
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">{{ $t('admin.operationLogs') }}</h2>
          </div>

          <div v-if="loadingLogs" class="loading">
            <Loader2 class="loading-icon spin" />
          </div>

          <div v-else-if="logs.length === 0" class="no-data-panel">{{ $t('admin.noLogs') }}</div>

          <div v-else class="list">
            <div v-for="log in logs" :key="log.id" class="log-item">
              <div class="log-icon"><component :is="getLogIcon(log.action)" /></div>
              <div class="log-info">
                <p class="log-action">{{ getActionLabel(log.action) }}</p>
                <p v-if="log.details" class="log-details">{{ JSON.stringify(log.details) }}</p>
              </div>
              <span class="log-date">{{ formatDate(log.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <ConfirmModal v-if="showConfirm" :title="confirmTitle" :message="confirmMessage" @confirm="handleConfirm" @cancel="showConfirm = false" />
    <EditSpotModal v-if="editingSpot" :spot="editingSpot" @submit="handleEditSpot" @cancel="editingSpot = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Shield, LogOut, MapPin, Image as ImageIcon, Star, Plus, Eye, Trash2, Loader2, Edit, Database, Activity, PlusCircle, Upload, Delete, CheckCircle, XCircle } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useDatabaseUsage } from '@/composables/useDatabaseUsage'
import { useReports } from '@/composables/useReports'
import { useAdminLogs } from '@/composables/useAdminLogs'
import { useStatistics } from '@/composables/useStatistics'
import ConfirmModal from '@/components/ConfirmModal.vue'
import EditSpotModal from '@/components/EditSpotModal.vue'

const router = useRouter()
const { t } = useI18n()
const { usagePercent: dbUsagePercent, fetchDatabaseUsage } = useDatabaseUsage()
const { reports, fetchReports, updateReportStatus } = useReports()
const { logs, fetchLogs } = useAdminLogs()
const { fetchOverview, fetchImagesPerDay, fetchRatingsPerDay, fetchTopSpots, fetchRecentActivity } = useStatistics()

const loading = ref(true)
const loadingReports = ref(true)
const loadingLogs = ref(true)
const spots = ref([])
const stats = ref({ totalSpots: 0, totalImages: 0, totalRatings: 0 })
const imagesPerDay = ref([])
const ratingsPerDay = ref([])
const topSpots = ref([])
const recentActivity = ref([])
const reportFilter = ref('pending')

const showConfirm = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref(null)
const editingSpot = ref(null)
const activeTab = ref('overview')

const tabs = computed(() => [
  { id: 'overview', label: t('admin.statistics') },
  { id: 'spots', label: t('admin.spotManagement') },
  { id: 'reports', label: t('admin.reportSystem'), badge: reports.value.filter(r => r.status === 'pending').length || null },
  { id: 'logs', label: t('admin.operationLogs') }
])

const reportFilters = computed(() => [
  { value: 'pending', label: t('admin.pendingImages') },
  { value: 'resolved', label: t('admin.resolvedImages') },
  { value: 'all', label: t('admin.allImages') }
])

const filteredReports = computed(() => {
  if (reportFilter.value === 'all') return reports.value
  return reports.value.filter(r => r.status === reportFilter.value)
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN') + ' ' + new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const getReasonLabel = (reason) => {
  const reasons = { inappropriate: t('report.reasons.inappropriate'), spam: t('report.reasons.spam'), copyright: t('report.reasons.copyright'), other: t('report.reasons.other') }
  return reasons[reason] || reason
}

const getReasonColor = (reason) => {
  const colors = { inappropriate: 'red', spam: 'yellow', copyright: 'purple', other: 'gray' }
  return colors[reason] || 'gray'
}

const getStatusLabel = (status) => {
  const statuses = { pending: t('admin.statusPending'), resolved: t('admin.statusResolved'), rejected: t('admin.statusRejected') }
  return statuses[status] || status
}

const getActionLabel = (action) => t(`admin.actionTypes.${action}`) || action

const getLogIcon = (action) => {
  const icons = { create_spot: PlusCircle, update_spot: Edit, delete_spot: Delete, upload_image: Upload, delete_image: Delete, add_rating: Star, delete_rating: Delete, resolve_report: CheckCircle, reject_report: XCircle }
  return icons[action] || Activity
}

const openEditModal = (spot) => { editingSpot.value = { ...spot } }

const handleEditSpot = async (formData) => {
  const { error } = await supabase.from('spots').update({ name: formData.name, location: formData.location, description: formData.description, cover_image: formData.cover_image }).eq('id', formData.id)
  if (error) { alert('更新失败: ' + error.message); return }
  editingSpot.value = null
  await fetchSpots()
}

const handleLogout = () => { localStorage.removeItem('adminLoggedIn'); router.push('/LSTAdmin/login') }

const fetchStats = async () => {
  const [spotsRes, imagesRes, ratingsRes] = await Promise.all([
    supabase.from('spots').select('*', { count: 'exact' }),
    supabase.from('images').select('*', { count: 'exact' }),
    supabase.from('ratings').select('*', { count: 'exact' })
  ])
  stats.value = { totalSpots: spotsRes.count || 0, totalImages: imagesRes.count || 0, totalRatings: ratingsRes.count || 0 }
}

const fetchSpots = async () => {
  loading.value = true
  const { data, error } = await supabase.from('spots').select('*').order('created_at', { ascending: false })
  if (error) console.error('Error fetching spots:', error)
  const spotsWithCounts = await Promise.all((data || []).map(async (spot) => {
    const [{ count: imageCount }, { count: ratingCount }] = await Promise.all([
      supabase.from('images').select('*', { count: 'exact', head: true }).eq('spot_id', spot.id),
      supabase.from('ratings').select('*', { count: 'exact', head: true }).eq('image_id', spot.id)
    ])
    return { ...spot, image_count: imageCount || 0, rating_count: ratingCount || 0 }
  }))
  spots.value = spotsWithCounts
  loading.value = false
}

const confirmDeleteSpot = (spot) => {
  confirmTitle.value = t('admin.deleteSpot')
  confirmMessage.value = t('admin.deleteSpotConfirm', { name: spot.name })
  confirmAction.value = async () => {
    await supabase.from('images').delete().eq('spot_id', spot.id)
    const { error: spotError } = await supabase.from('spots').delete().eq('id', spot.id)
    if (spotError) { alert('删除景点失败: ' + spotError.message); return }
    await fetchSpots()
    await fetchStats()
  }
  showConfirm.value = true
}

const handleReportAction = async (report, status, action = null) => {
  const result = await updateReportStatus(report.id, status, action)
  if (result.success) await fetchReports()
}

const handleConfirm = async () => {
  if (confirmAction.value) await confirmAction.value()
  showConfirm.value = false
}

const loadAllData = async () => {
  await Promise.all([
    fetchSpots(), fetchStats(), fetchDatabaseUsage(),
    fetchReports().then(() => { loadingReports.value = false }),
    fetchLogs().then(() => { loadingLogs.value = false }),
    fetchOverview().then(data => { stats.value = data }),
    fetchImagesPerDay(7).then(data => { imagesPerDay.value = data }),
    fetchRatingsPerDay(7).then(data => { ratingsPerDay.value = data }),
    fetchTopSpots().then(data => { topSpots.value = data }),
    fetchRecentActivity().then(data => { recentActivity.value = data })
  ])
}

onMounted(() => {
  if (!localStorage.getItem('adminLoggedIn')) { router.push('/LSTAdmin/login'); return }
  loadAllData()
})
</script>

<style scoped>
.admin-dashboard { min-height: 100vh; background: #f9fafb; }

.admin-header {
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 50;
  margin: 16px;
  border-radius: 8px;
  padding: 16px;
}
.admin-header-inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
.admin-title { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 700; color: #111827; }
.admin-icon { width: 32px; height: 32px; color: #0284c7; }
.logout-btn { display: flex; align-items: center; gap: 4px; color: #4b5563; background: none; border: none; cursor: pointer; transition: color 150ms; }
.logout-btn:hover { color: #dc2626; }
.logout-icon { width: 20px; height: 20px; }

.admin-main { max-width: 1280px; margin: 0 auto; padding: 32px 16px; }

.tabs { display: flex; gap: 8px; border-bottom: 1px solid #e5e7eb; margin-bottom: 24px; }
.tab-btn { padding: 8px 16px; font-weight: 500; color: #6b7280; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: all 150ms; display: flex; align-items: center; gap: 8px; margin-bottom: -1px; }
.tab-btn:hover { color: #374151; }
.tab-btn.active { color: #0284c7; border-bottom-color: #0284c7; }
.tab-badge { background: #ef4444; color: white; font-size: 12px; padding: 2px 8px; border-radius: 9999px; }

.stats-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 24px; margin-bottom: 32px; }
@media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }

.stat-card { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.stat-icon.blue { background: #dbeafe; }
.stat-icon.green { background: #dcfce7; }
.stat-icon.yellow { background: #fef9c3; }
.stat-icon.purple { background: #f3e8ff; }
.stat-icon-inner { width: 24px; height: 24px; }
.stat-icon.blue .stat-icon-inner { color: #2563eb; }
.stat-icon.green .stat-icon-inner { color: #16a34a; }
.stat-icon.yellow .stat-icon-inner { color: #ca8a04; }
.stat-icon.purple .stat-icon-inner { color: #9333ea; }
.stat-value { font-size: 24px; font-weight: 700; color: #111827; }
.stat-label { font-size: 14px; color: #6b7280; }
.progress-bar { width: 100%; height: 6px; background: #e5e7eb; border-radius: 9999px; margin-top: 4px; }
.progress-fill { height: 6px; border-radius: 9999px; transition: all 150ms; }

.charts-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 24px; margin-bottom: 32px; }
@media (min-width: 1024px) { .charts-grid { grid-template-columns: repeat(2, 1fr); } }
.chart-card { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
.chart-title { font-weight: 600; margin-bottom: 16px; }
.chart-bars { height: 192px; display: flex; align-items: flex-end; gap: 8px; }
.chart-bar { flex: 1; border-radius: 4px 4px 0 0; transition: all 150ms; cursor: pointer; }
.chart-bar.primary { background: #0ea5e9; }
.chart-bar.primary:hover { background: #0284c7; }
.chart-bar.yellow { background: #eab308; }
.chart-bar.yellow:hover { background: #ca8a04; }

.lists-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 24px; }
@media (min-width: 1024px) { .lists-grid { grid-template-columns: repeat(2, 1fr); } }
.list-card { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
.list-title { font-weight: 600; margin-bottom: 12px; }
.list-items { display: flex; flex-direction: column; gap: 12px; }
.list-item { display: flex; align-items: center; justify-content: space-between; }
.list-item-left { display: flex; align-items: center; gap: 12px; }
.rank { width: 24px; height: 24px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 500; }
.name { font-weight: 500; }
.count { font-size: 14px; color: #6b7280; }
.activity-item { display: flex; align-items: center; gap: 12px; font-size: 14px; }
.activity-dot { width: 8px; height: 8px; border-radius: 50%; }
.activity-dot.green { background: #22c55e; }
.activity-dot.yellow { background: #eab308; }
.activity-desc { flex: 1; }
.activity-date { font-size: 12px; color: #9ca3af; }
.no-data { text-align: center; color: #9ca3af; padding: 16px 0; }

.panel { background: white; border-radius: 8px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
.panel-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; padding: 16px 24px; border-bottom: 1px solid #e5e7eb; }
.panel-title { font-size: 18px; font-weight: 600; }

.btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; font-size: 14px; font-weight: 500; border-radius: 8px; transition: all 150ms; cursor: pointer; border: none; text-decoration: none; }
.btn-primary { background: #0ea5e9; color: white; }
.btn-primary:hover { background: #0284c7; }
.btn-danger { background: #ef4444; color: white; }
.btn-danger:hover { background: #dc2626; }
.btn-success { background: #22c55e; color: white; }
.btn-success:hover { background: #16a34a; }
.btn-sm { padding: 6px 12px; font-size: 14px; }
.btn-icon { width: 16px; height: 16px; }

.filters { display: flex; gap: 8px; }
.filter-btn { padding: 4px 12px; font-size: 14px; border-radius: 4px; border: none; cursor: pointer; background: #f3f4f6; transition: all 150ms; }
.filter-btn:hover { background: #e5e7eb; }
.filter-btn.active { background: #0ea5e9; color: white; }

.loading { padding: 24px; text-align: center; }
.loading-icon { width: 32px; height: 32px; margin: 0 auto; color: #0ea5e9; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.list { border-top: 1px solid #e5e7eb; }
.list-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid #e5e7eb; transition: background 150ms; }
.list-row:hover { background: #f9fafb; }
.spot-info { display: flex; align-items: center; gap: 16px; }
.spot-img { width: 64px; height: 64px; object-fit: cover; border-radius: 8px; }
.spot-img.placeholder { background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; }
.spot-img.placeholder svg { width: 24px; height: 24px; }
.spot-name { font-weight: 500; }
.spot-location { font-size: 14px; color: #6b7280; }
.spot-stats { font-size: 12px; color: #9ca3af; }
.actions { display: flex; gap: 8px; }
.action-btn { padding: 8px; color: #6b7280; background: none; border: none; cursor: pointer; border-radius: 4px; transition: all 150ms; }
.action-btn:hover { background: #f3f4f6; }
.action-btn.danger:hover { color: #dc2626; }
.action-btn svg { width: 20px; height: 20px; }
.no-data-panel { padding: 32px; text-align: center; color: #6b7280; }

.report-item { padding: 16px 24px; border-bottom: 1px solid #e5e7eb; }
.report-content { display: flex; gap: 16px; }
.report-image { width: 80px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
.report-image img { width: 100%; height: 100%; object-fit: cover; }
.report-image-placeholder { width: 100%; height: 100%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; }
.report-image-placeholder svg { width: 32px; height: 32px; }
.report-details { flex: 1; min-width: 0; }
.report-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.badge { padding: 2px 8px; font-size: 12px; font-weight: 500; border-radius: 4px; }
.badge-orange { background: #ffedd5; color: #c2410c; }
.badge-blue { background: #dbeafe; color: #1d4ed8; }
.badge-red { background: #fee2e2; color: #dc2626; }
.badge-yellow { background: #fef9c3; color: #a16207; }
.badge-purple { background: #f3e8ff; color: #7e22ce; }
.badge-gray { background: #f3f4f6; color: #4b5563; }
.badge-status-pending { background: #fef9c3; color: #a16207; }
.badge-status-resolved { background: #dcfce7; color: #16a34a; }
.badge-status-rejected { background: #f3f4f6; color: #4b5563; }
.report-spot { font-size: 14px; color: #374151; margin-bottom: 8px; }
.report-comment { background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
.comment-author { font-weight: 500; font-size: 14px; margin-right: 8px; }
.comment-stars { display: inline-flex; gap: 2px; }
.star { width: 12px; height: 12px; color: #d1d5db; }
.star.filled { color: #facc15; fill: #facc15; }
.comment-text { font-size: 14px; color: #4b5563; margin-top: 4px; }
.report-desc { font-size: 14px; color: #6b7280; font-style: italic; margin-bottom: 4px; }
.report-date { font-size: 12px; color: #9ca3af; }
.report-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }

.log-item { display: flex; align-items: center; gap: 16px; padding: 16px 24px; border-bottom: 1px solid #e5e7eb; }
.log-icon { width: 40px; height: 40px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.log-icon svg { width: 20px; height: 20px; color: #4b5563; }
.log-info { flex: 1; }
.log-action { font-weight: 500; }
.log-details { font-size: 14px; color: #6b7280; }
.log-date { font-size: 12px; color: #9ca3af; }
</style>
