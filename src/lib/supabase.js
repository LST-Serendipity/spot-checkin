import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-10) : 'NOT SET')

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Please configure .env file.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    global: {
      headers: {
        apikey: supabaseAnonKey || ''
      }
    }
  }
)

export const STORAGE_URL = supabaseUrl
export const STORAGE_BUCKET = 'spot-images'
