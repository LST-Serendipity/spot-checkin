import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useSpots() {
  const spots = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchSpots = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('spots')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      spots.value = data || []
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const getSpotById = async (id) => {
    const { data, error: err } = await supabase
      .from('spots')
      .select('*')
      .eq('id', id)
      .single()

    if (err) throw err
    return data
  }

  const createSpot = async (spotData) => {
    const { data, error: err } = await supabase
      .from('spots')
      .insert([spotData])
      .select()
      .single()

    if (err) throw err
    return data
  }

  return {
    spots,
    loading,
    error,
    fetchSpots,
    getSpotById,
    createSpot
  }
}
