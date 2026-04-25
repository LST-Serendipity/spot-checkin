import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useCycle() {
  const CYCLE_DAYS = 3
  const MAX_IMAGES_PER_SPOT = 10

  const getCycleStart = (date = new Date()) => {
    const timestamp = new Date(date)
    timestamp.setHours(0, 0, 0, 0)
    const daysSinceEpoch = Math.floor(timestamp.getTime() / (1000 * 60 * 60 * 24))
    const cycleDay = daysSinceEpoch % CYCLE_DAYS
    const cycleStart = new Date(timestamp)
    cycleStart.setDate(cycleStart.getDate() - cycleDay)
    return cycleStart
  }

  const getCycleEnd = (cycleStart) => {
    const end = new Date(cycleStart)
    end.setDate(end.getDate() + CYCLE_DAYS)
    return end
  }

  const getTimeUntilNextCycle = () => {
    const now = new Date()
    const cycleStart = getCycleStart(now)
    const cycleEnd = getCycleEnd(cycleStart)
    const diff = cycleEnd - now

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return { days, hours, minutes, total: diff }
  }

  const isInUploadWindow = (cycleStart) => {
    const now = new Date()
    const cycleEnd = getCycleEnd(new Date(cycleStart))
    return now < cycleEnd
  }

  const canUpload = async (spotId) => {
    const { data: spot } = await supabase
      .from('spots')
      .select('current_cycle_start')
      .eq('id', spotId)
      .single()

    if (!spot || !spot.current_cycle_start) return false
    if (!isInUploadWindow(new Date(spot.current_cycle_start))) return false

    const { count } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('spot_id', spotId)
      .eq('is_kept', false)

    return count < MAX_IMAGES_PER_SPOT
  }

  const getCurrentCycleInfo = () => {
    const cycleStart = getCycleStart()
    const cycleEnd = getCycleEnd(cycleStart)
    const timeLeft = getTimeUntilNextCycle()

    return {
      cycleStart,
      cycleEnd,
      timeLeft,
      isInWindow: true
    }
  }

  return {
    CYCLE_DAYS,
    MAX_IMAGES_PER_SPOT,
    getCycleStart,
    getCycleEnd,
    getTimeUntilNextCycle,
    isInUploadWindow,
    canUpload,
    getCurrentCycleInfo
  }
}
