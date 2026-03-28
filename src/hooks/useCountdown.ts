import { useState, useEffect, useRef } from 'react'

export const useCountdown = (endTime: string | null) => {
  const [remaining, setRemaining] = useState<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!endTime) {
      return
    }

    const calc = () => {
      const diff = Math.max(0, Math.round((new Date(endTime).getTime() - Date.now()) / 1000))
      setRemaining(diff)

      if (diff === 0 && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    calc()
    intervalRef.current = setInterval(calc, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [endTime])

  // Sync từ server timer_tick
  const syncFromServer = (serverRemaining: number) => {
    setRemaining(serverRemaining)
  }

  return {
    remaining: endTime ? remaining : 0,
    syncFromServer,
  }
}