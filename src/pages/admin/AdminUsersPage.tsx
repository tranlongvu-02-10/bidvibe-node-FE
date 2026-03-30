import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'
import { Badge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatDate } from '../../utils/format'

export const AdminUsersPage = () => {
  const queryClient = useQueryClient()
  const [page,    setPage]    = useState(0)
  const [search,  setSearch]  = useState('')
  const [searchQ, setSearchQ] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', searchQ, page],
    queryFn:  () => adminApi.getUsers({ search: searchQ || undefined, page }),
  })

  const banMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.banUser(id, reason),
    onSuccess: () => {
      toast.success('Đã khóa tài khoản')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const unbanMutation = useMutation({
    mutationFn: (id: string) => adminApi.unbanUser(id),
    onSuccess: () => {
      toast.success('Đã mở khóa tài khoản')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const muteMutation = useMutation({
    mutationFn: (id: string) => adminApi.muteUser(id),
    onSuccess: () => {
      toast.success('Đã tắt chat user')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const unmuteMutation = useMutation({
    mutationFn: (id: string) => adminApi.unmuteUser(id),
    onSuccess: () => {
      toast.success('Đã bật lại chat')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Quản lý người dùng</h1>
          <p className="text-sm text-gray-400 mt-0.5">{data?.totalElements ?? 0} người dùng</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setSearchQ(search), setPage(0))}
            placeholder="Tìm theo email hoặc nickname..."
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none"
          />
        </div>
        <button
          onClick={() => { setSearchQ(search); setPage(0) }}
          className="px-4 py-2.5 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700"
        >
          Tìm
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <PageSpinner />
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Người dùng', 'Vai trò', 'Uy tín', 'Trạng thái', 'Ngày tham gia', 'Thao tác'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.content.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-medium text-purple-600">
                          {user.nickname?.slice(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.nickname}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'ADMIN' ? 'purple' : 'gray'}>
                        {user.role === 'ADMIN' ? 'Admin' : 'User'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {Number(user.reputationScore).toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {user.isBanned && <Badge variant="red">Bị khóa</Badge>}
                        {user.isMuted  && <Badge variant="amber">Tắt chat</Badge>}
                        {!user.isBanned && !user.isMuted && <Badge variant="green">Bình thường</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-400">{formatDate(user.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {user.isMuted ? (
                          <button
                            onClick={() => unmuteMutation.mutate(user.id)}
                            className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                          >
                            Bật chat
                          </button>
                        ) : (
                          <button
                            onClick={() => muteMutation.mutate(user.id)}
                            className="px-2.5 py-1 text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200"
                          >
                            Tắt chat
                          </button>
                        )}
                        {user.isBanned ? (
                          <button
                            onClick={() => unbanMutation.mutate(user.id)}
                            className="px-2.5 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200"
                          >
                            Mở khóa
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const reason = prompt('Lý do khóa tài khoản:')
                              if (reason) banMutation.mutate({ id: user.id, reason })
                            }}
                            className="px-2.5 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200"
                          >
                            Khóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}