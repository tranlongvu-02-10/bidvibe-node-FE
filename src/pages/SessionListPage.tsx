import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { sessionApi } from '../api/sessionApi'
import { SessionCard } from '../components/SessionCard'
import { Pagination } from '../components/ui/Pagination'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import type { SessionStatus, SessionType } from '../types'

const statusOptions: { value: SessionStatus | ''; label: string }[] = [
  { value: '',           label: 'Tất cả'       },
  { value: 'ACTIVE',     label: 'Đang live'     },
  { value: 'SCHEDULED',  label: 'Sắp diễn ra'  },
  { value: 'COMPLETED',  label: 'Đã kết thúc'  },
  { value: 'CANCELLED',  label: 'Đã hủy'        },
]

const typeOptions: { value: SessionType | ''; label: string }[] = [
  { value: '',        label: 'Tất cả loại'   },
  { value: 'ENGLISH', label: 'Tăng dần'      },
  { value: 'DUTCH',   label: 'Giảm dần'      },
  { value: 'SEALED',  label: 'Đấu giá kín'   },
]

export const SessionListPage = () => {
  const [page,   setPage]   = useState(0)
  const [status, setStatus] = useState<SessionStatus | ''>('')
  const [type,   setType]   = useState<SessionType | ''>('')

  const { data, isLoading } = useQuery({
    queryKey: ['sessions', status, type, page],
    queryFn:  () => sessionApi.getSessions({
      status: status || undefined,
      type:   type   || undefined,
      page,
    }),
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-1">
          Phiên đấu giá
        </h1>
        <p className="text-sm text-gray-400">
          {data?.totalElements ?? 0} phiên đấu giá
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Status filter */}
        <div className="flex gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatus(opt.value); setPage(0) }}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                status === opt.value
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200 dark:bg-gray-700 self-stretch" />

        {/* Type filter */}
        <div className="flex gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setType(opt.value); setPage(0) }}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                type === opt.value
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSpinner />
      ) : !data?.content.length ? (
        <EmptyState
          title="Không có phiên nào"
          description="Thử thay đổi bộ lọc hoặc quay lại sau"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.content.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}