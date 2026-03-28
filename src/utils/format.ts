// Format tiền VND: 2100000 → "2.100.000₫"
export const formatVND = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num)
}

// Format ngày: "2026-03-28T10:00:00Z" → "28/03/2026 10:00"
export const formatDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}

// Format countdown: 125 → "02:05"
export const formatCountdown = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Format số lớn: 1520 → "1.5k"
export const formatNumber = (num: number): string => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return String(num)
}

// Rarity label
export const rarityLabel: Record<string, string> = {
  COMMON: 'Phổ thông',
  RARE: 'Hiếm',
  LEGENDARY: 'Huyền thoại',
}

// Rarity color classes (Tailwind)
export const rarityColor: Record<string, string> = {
  COMMON:    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  RARE:      'bg-purple-50 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
  LEGENDARY: 'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
}