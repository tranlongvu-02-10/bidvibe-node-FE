import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { userApi } from '../api/userApi'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate } from '../utils/format'

export const PublicProfilePage = () => {
  const { id } = useParams<{ id: string }>()

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['user-profile', id],
    queryFn:  () => userApi.getPublicProfile(id!),
    enabled:  !!id,
  })

  const { data: ratingsData, isLoading: loadingRatings } = useQuery({
    queryKey: ['user-ratings', id],
    queryFn:  () => userApi.getRatings(id!),
    enabled:  !!id,
  })

  if (loadingProfile) return <PageSpinner />
  if (!profile) return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <EmptyState title="Người dùng không tồn tại" />
    </div>
  )

  const stars = Math.round(profile.reputationScore)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Profile card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-2xl font-medium text-purple-600">
            {profile.nickname?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-white">
              {profile.nickname}
            </h1>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < stars ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                />
              ))}
              <span className="text-xs text-gray-400 ml-1">
                {Number(profile.reputationScore).toFixed(1)} ({ratingsData?.totalElements ?? 0} đánh giá)
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Tham gia {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Ratings */}
      <h2 className="text-base font-medium text-gray-900 dark:text-white mb-4">
        Đánh giá nhận được
      </h2>

      {loadingRatings ? (
        <PageSpinner />
      ) : !ratingsData?.content.length ? (
        <EmptyState title="Chưa có đánh giá nào" />
      ) : (
        <div className="space-y-3">
          {ratingsData.content.map((rating) => (
            <div
              key={rating.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-medium text-purple-600">
                    {rating.fromNickname?.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {rating.fromNickname}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < rating.stars ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>
              {rating.comment && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{rating.comment}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">{formatDate(rating.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}