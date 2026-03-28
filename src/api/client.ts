import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { getAccessToken } from '../lib/supabase'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// ── Request interceptor: đính JWT vào mọi request ──────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: unwrap data, xử lý lỗi ──────────
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap ApiResponse wrapper → trả về response.data.data
    if (response.data && 'success' in response.data) {
      if (!response.data.success) {
        return Promise.reject(response.data)
      }
      response.data = response.data.data
    }
    return response
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token hết hạn → logout
      const { supabase } = await import('../lib/supabase')
      await supabase.auth.signOut()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient