import { useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { userApi } from '../api/userApi'

export const useAuth = () => {
  const { user, isLoading, setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    // thay đổi auth state từ Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          try {
            // Lấy user profile từ backend
            const profile = await userApi.getMe()
            setUser(profile)
          } catch {
            setUser(null)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const logoutUser = async () => {
    await supabase.auth.signOut()
    logout()
  }

  return { user, isLoading, loginWithGoogle, logoutUser }
}