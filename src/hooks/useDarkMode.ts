import { useState, useEffect } from 'react'

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('bidvibe-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('bidvibe-theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('bidvibe-theme', 'light')
    }
  }, [isDark])

  return { isDark, toggle: () => setIsDark(d => !d) }
}