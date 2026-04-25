import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useSpotsStore = defineStore('spots', () => {
  const spots = ref([])
  const currentSpot = ref(null)
  const loading = ref(false)

  const fetchSpots = async () => {
    loading.value = true
    const { data } = await supabase
      .from('spots')
      .select('*')
      .order('created_at', { ascending: false })
    spots.value = data || []
    loading.value = false
  }

  const fetchSpotById = async (id) => {
    loading.value = true
    const { data } = await supabase
      .from('spots')
      .select('*')
      .eq('id', id)
      .single()
    currentSpot.value = data
    loading.value = false
    return data
  }

  const addSpot = async (spotData) => {
    const { data } = await supabase
      .from('spots')
      .insert([spotData])
      .select()
      .single()
    if (data) {
      spots.value.unshift(data)
    }
    return data
  }

  return {
    spots,
    currentSpot,
    loading,
    fetchSpots,
    fetchSpotById,
    addSpot
  }
})
