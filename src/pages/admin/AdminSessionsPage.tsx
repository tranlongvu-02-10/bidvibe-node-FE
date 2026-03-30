import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'
import { sessionApi } from '../../api/sessionApi'
import { Badge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatDate } from '../../utils/format'
import type { SessionType } from '../../types'

const CreateSessionModal = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title:     '',
    type:      'ENGLISH' as SessionType,
    startTime: '',
  })

  const mutation = useMutation({
    mutationFn: () => adminApi.createSession(form),
    onSuccess: () => {
      toast.success('Đã tạo phiên đấu giá!')
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
      onClose()
    },
    onError: () => toast.error('Tạo phiên thất bại'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6">
        <h3 className="text-base font-medium mb-4">Tạo phiên đấu giá mới</h3>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tiêu đề</label>
            <input
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Phiên English Auction Tuần 1..."
              className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Loại đấu giá</label>
            <select
              value={form.type}
              onChange={(e) => setForm(p => ({ ...p, type: e.target.value as SessionType }))}
              className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none"
            >
              <option value="ENGLISH">Tăng dần (English)</option>
              <option value="DUTCH">Giảm dần (Dutch)</option>
              <option value="SEALED">Đấu giá kín (Sealed)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Thời gian bắt đầu</label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm(p => ({ ...p, startTime: new Date(e.target.value).toISOString() }))}
              className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl">
            Hủy
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!form.title || !form.startTime || mutation.isPending}
            className="flex-1 py-2.5 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Đang tạo...' : 'Tạo phiên'}
          </button>
        </div>
      </div>
    </div>
  )
}

export const AdminSessionsPage = () => {
  const queryClient = useQueryClient()
  const [page,       setPage]       = useState(0)
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-sessions', page],
    queryFn:  () => sessionApi.getSessions({ page }),
  })

  const startMutation = useMutation({
    mutationFn: (id: string) => adminApi.startSession(id),
    onSuccess: () => { toast.success('Đã START phiên!'); queryClient.invalidateQueries({ queryKey: ['admin-sessions'] }) },
    onError:   () => toast.error('Thao tác thất bại'),
  })

  const pauseMutation = useMutation({
    mutationFn: (id: string) => adminApi.pauseSession(id),
    onSuccess: () => { toast.success('Đã PAUSE phiên'); queryClient.invalidateQueries({ queryKey: ['admin-sessions'] }) },
  })

  const resumeMutation = useMutation({
    mutationFn: (id: string) => adminApi.resumeSession(id),
    onSuccess: () => { toast.success('Đã RESUME phiên'); queryClient.invalidateQueries({ queryKey: ['admin-sessions'] }) },
  })

  const stopMutation = useMutation({
    mutationFn: (id: string) => adminApi.stopSession(id),
    onSuccess: () => { toast.success('Đã STOP phiên'); queryClient.invalidateQueries({ queryKey: ['admin-sessions'] }) },
  })

  const typeLabel  = { ENGLISH: 'Tăng dần', DUTCH: 'Giảm dần', SEALED: 'Kín' }
  const typeVariant: Record<string, 'purple' | 'amber' | 'teal'> = { ENGLISH: 'purple', DUTCH: 'amber', SEALED: 'teal' }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Quản lý phiên đấu giá</h1>
          <p className="text-sm text-gray-400 mt-0.5">{data?.totalElements ?? 0} phiên</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700"
        >
          <Plus size={15} />
          Tạo phiên mới
        </button>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <>
          <div className="space-y-3">
            {data?.content.map((session) => (
              <div
                key={session.id}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={typeVariant[session.type]}>{typeLabel[session.type]}</Badge>
                    <div>
                      <Link
                        to={`/admin/sessions/${session.id}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-purple-600"
                      >
                        {session.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(session.startTime)}</p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      session.status === 'ACTIVE'    ? 'green'  :
                      session.status === 'PAUSED'    ? 'amber'  :
                      session.status === 'COMPLETED' ? 'gray'   :
                      session.status === 'CANCELLED' ? 'red'    : 'gray'
                    }>
                      {session.status === 'SCHEDULED' ? 'Chờ'       :
                       session.status === 'ACTIVE'    ? 'Đang chạy' :
                       session.status === 'PAUSED'    ? 'Tạm dừng'  :
                       session.status === 'COMPLETED' ? 'Hoàn thành':
                       session.status === 'CANCELLED' ? 'Đã hủy'    : session.status}
                    </Badge>

                    {session.status === 'SCHEDULED' && (
                      <button
                        onClick={() => startMutation.mutate(session.id)}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        START
                      </button>
                    )}
                    {session.status === 'ACTIVE' && (
                      <>
                        <button
                          onClick={() => pauseMutation.mutate(session.id)}
                          className="px-3 py-1.5 text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200"
                        >
                          PAUSE
                        </button>
                        <button
                          onClick={() => stopMutation.mutate(session.id)}
                          className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200"
                        >
                          STOP
                        </button>
                      </>
                    )}
                    {session.status === 'PAUSED' && (
                      <button
                        onClick={() => resumeMutation.mutate(session.id)}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        RESUME
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}

      {showCreate && <CreateSessionModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}