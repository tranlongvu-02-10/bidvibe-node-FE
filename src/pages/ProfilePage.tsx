import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { userApi } from '../api/userApi'
import { useAuthStore } from '../store/authStore'
import { formatDate } from '../utils/format'

export const ProfilePage = () => {
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()

  // Khởi tạo form trực tiếp từ user — không cần useEffect
  const [form, setForm] = useState({
    nickname: user?.nickname || '',
    phone:    user?.phone    || '',
    address:  user?.address  || '',
  })

  const mutation = useMutation({
    mutationFn: () => userApi.updateMe(form),
    onSuccess: (data) => {
      setUser(data)
      toast.success('Cập nhật hồ sơ thành công!')
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
    onError: () => toast.error('Cập nhật thất bại'),
  })

  if (!user) return null

  const stars = Math.round(user.reputationScore)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-8">Hồ sơ cá nhân</h1>

      {/* Avatar + info */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-2xl font-medium text-purple-600">
            {user.nickname?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {user.nickname}
            </h2>
            <p className="text-sm text-gray-400">{user.email}</p>
            {/* Stars */}
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < stars ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}
                />
              ))}
              <span className="text-xs text-gray-400 ml-1">
                {Number(user.reputationScore).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-xs text-gray-400">Vai trò</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
              {user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Ngày tham gia</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          Chỉnh sửa thông tin
        </h3>

        <div className="space-y-4">
          {[
            { key: 'nickname', label: 'Tên hiển thị', placeholder: 'Nhập nickname...' },
            { key: 'phone',    label: 'Số điện thoại', placeholder: '0901234567'      },
            { key: 'address',  label: 'Địa chỉ giao hàng', placeholder: '123 Nguyễn Huệ, Q1, TP.HCM' },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
              <input
                type="text"
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full mt-6 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  )
}