import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const CYCLE_DAYS = 3
const KEEP_TOP_N = 2

interface CycleInfo {
  cycleStart: Date
  cycleEnd: Date
}

function getCycleInfo(date: Date = new Date()): CycleInfo {
  const timestamp = new Date(date)
  timestamp.setHours(0, 0, 0, 0)
  const daysSinceEpoch = Math.floor(timestamp.getTime() / (1000 * 60 * 60 * 24))
  const cycleDay = daysSinceEpoch % CYCLE_DAYS
  const cycleStart = new Date(timestamp)
  cycleStart.setDate(cycleStart.getDate() - cycleDay)

  const cycleEnd = new Date(cycleStart)
  cycleEnd.setDate(cycleEnd.getDate() + CYCLE_DAYS)

  return { cycleStart, cycleEnd }
}

async function evaluateAndCleanupSpot(spotId: string, cycleStart: Date) {
  console.log(`Evaluating spot ${spotId} for cycle starting ${cycleStart.toISOString()}`)

  const { data: images, error: fetchError } = await supabase
    .from('images')
    .select('id, url, total_score, rating_count')
    .eq('spot_id', spotId)
    .eq('is_kept', false)
    .eq('cycle_start', cycleStart.toISOString())

  if (fetchError) {
    console.error(`Error fetching images for spot ${spotId}:`, fetchError)
    return
  }

  if (!images || images.length === 0) {
    console.log(`No images to evaluate for spot ${spotId}`)
    return
  }

  const sortedImages = [...images].sort((a, b) => {
    const scoreA = a.rating_count > 0 ? a.total_score / a.rating_count : 0
    const scoreB = b.rating_count > 0 ? b.total_score / b.rating_count : 0
    return scoreB - scoreA
  })

  const keepImages = sortedImages.slice(0, KEEP_TOP_N)
  const deleteImages = sortedImages.slice(KEEP_TOP_N)

  console.log(`Keeping ${keepImages.length} images, deleting ${deleteImages.length} images`)

  for (const image of keepImages) {
    await supabase
      .from('images')
      .update({ is_kept: true })
      .eq('id', image.id)
    console.log(`Kept image ${image.id}`)
  }

  for (const image of deleteImages) {
    const urlParts = image.url.split('/')
    const fileName = urlParts.slice(-2).join('/')

    await supabase.storage
      .from('spot-images')
      .remove([fileName])

    await supabase
      .from('images')
      .delete()
      .eq('id', image.id)

    console.log(`Deleted image ${image.id}`)
  }

  const newCycleStart = new Date()
  newCycleStart.setHours(0, 0, 0, 0)
  const daysSinceEpoch = Math.floor(newCycleStart.getTime() / (1000 * 60 * 60 * 24))
  const cycleDay = daysSinceEpoch % CYCLE_DAYS
  newCycleStart.setDate(newCycleStart.getDate() - cycleDay)

  await supabase
    .from('spots')
    .update({ current_cycle_start: newCycleStart.toISOString() })
    .eq('id', spotId)

  console.log(`Updated spot ${spotId} to new cycle: ${newCycleStart.toISOString()}`)
}

async function runEvaluation() {
  console.log('Starting cycle evaluation...')

  const { data: spots, error: spotsError } = await supabase
    .from('spots')
    .select('id, current_cycle_start')

  if (spotsError) {
    console.error('Error fetching spots:', spotsError)
    return
  }

  const now = new Date()
  const { cycleStart, cycleEnd } = getCycleInfo(now)

  console.log(`Current cycle: ${cycleStart.toISOString()} to ${cycleEnd.toISOString()}`)
  console.log(`Found ${spots?.length || 0} spots to evaluate`)

  for (const spot of spots || []) {
    if (spot.current_cycle_start) {
      const spotCycleStart = new Date(spot.current_cycle_start)
      if (spotCycleStart < cycleEnd && now >= cycleEnd) {
        await evaluateAndCleanupSpot(spot.id, spotCycleStart)
      }
    }
  }

  console.log('Cycle evaluation completed!')
}

Deno.cron('Evaluate and cleanup every 6 hours', '0 */6 * * *', runEvaluation)

runEvaluation()
