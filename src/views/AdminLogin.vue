<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <Shield class="login-icon" />
        <h1 class="login-title">{{ $t('admin.loginTitle') }}</h1>
        <p class="login-subtitle">{{ $t('admin.loginKey') }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <input v-model="adminKey" type="password" :placeholder="$t('admin.loginKeyPlaceholder')" class="input" />
        </div>
        <button type="submit" :disabled="loading" class="btn btn-primary">
          {{ loading ? $t('admin.verifying') : $t('admin.loginBtn') }}
        </button>
        <p v-if="error" class="error-text">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Shield } from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()
const adminKey = ref('')
const loading = ref(false)
const error = ref('')

const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'LST030721'

const handleLogin = async () => {
  if (!adminKey.value) { error.value = t('admin.pleaseEnterKey'); return }
  loading.value = true
  error.value = ''
  await new Promise(resolve => setTimeout(resolve, 500))
  if (adminKey.value === ADMIN_KEY) {
    localStorage.setItem('adminLoggedIn', 'true')
    router.push('/LSTAdmin')
  } else { error.value = t('admin.loginError') }
  loading.value = false
}
</script>

<style scoped>
.login-page { min-height: 100vh; background: #f9fafb; display: flex; align-items: center; justify-content: center; padding: 16px; }
.login-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px); border-radius: 8px; padding: 32px; max-width: 448px; width: 100%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.login-header { text-align: center; margin-bottom: 32px; }
.login-icon { width: 64px; height: 64px; margin: 0 auto; color: #0ea5e9; }
.login-title { font-size: 24px; font-weight: 700; margin-top: 16px; color: #111827; }
.login-subtitle { color: #6b7280; margin-top: 8px; }
.login-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; }
.input { width: 100%; padding: 12px 16px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; transition: border-color 150ms, box-shadow 150ms; }
.input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2); }
.btn { padding: 12px 16px; font-size: 14px; font-weight: 500; border-radius: 8px; cursor: pointer; border: none; transition: all 150ms; }
.btn-primary { background: #0ea5e9; color: white; }
.btn-primary:hover { background: #0284c7; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.error-text { color: #dc2626; font-size: 14px; text-align: center; }
</style>
