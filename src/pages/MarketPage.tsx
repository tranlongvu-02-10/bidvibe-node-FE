import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { marketApi } from '../api/marketApi'
import { Pagination } from '../components/ui/Pagination'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { formatVND, rarityLabel, rarityColor } from '../utils/format'
import type { ItemRarity } from '../types'

const rarityOptions: { value: ItemRarity | ''; label: string }[] = [
  { value: '',          label: 'Tất cả'        },
  { value: 'LEGENDARY', label: 'Huyền thoại'   },
  { value: 'RARE',      label: 'Hiếm'          },
  { value: 'COMMON',    label: 'Phổ thông'     },
]

export const MarketPage = () => {
  const [page,     setPage]     = useState(0)
  const [rarity,   setRarity]   = useState<ItemRarity | ''>('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [search,   setSearch]   = useState('')
  const [showFilter, setShowFilter] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['market-listings', rarity, minPrice, maxPrice, page],
    queryFn: () => marketApi.getListings({
      rarity:   rarity   || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      page,
    }),
  })

  // Filter by search client-side
  const filtered = search
    ? data?.content.filter((l) =>
        l.itemName.toLowerCase().includes(search.toLowerCase())
      )
    : data?.content

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-1">
          Chợ Đen
        </h1>
        <p className="text-sm text-gray-400">
          Mua bán trực tiếp giữa người dùng — {data?.totalElements ?? 0} listing
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên vật phẩm..."
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl border transition-colors ${
            showFilter
              ? 'bg-purple-600 text-white border-purple-600'
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <SlidersHorizontal size={14} />
          Bộ lọc
        </button>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rarity */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Độ hiếm</label>
              <div className="flex flex-wrap gap-2">
                {rarityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setRarity(opt.value); setPage(0) }}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                      rarity === opt.value
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Giá tối thiểu</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(0) }}
                placeholder="0"
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Giá tối đa</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(0) }}
                placeholder="Không giới hạn"
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none"
              />
            </div>
          </div>

          <button
            onClick={() => { setRarity(''); setMinPrice(''); setMaxPrice(''); setPage(0) }}
            className="text-xs text-gray-400 hover:text-gray-600 mt-3"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Listings grid */}
      {isLoading ? (
        <PageSpinner />
      ) : !filtered?.length ? (
        <EmptyState
          title="Không tìm thấy listing nào"
          description="Thử thay đổi bộ lọc hoặc quay lại sau"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((listing) => (
              <Link
                key={listing.id}
                to={`/market/${listing.id}`}
                className="block bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                  {listing.itemImages?.[0] ? (
                    <img
                      src={listing.itemImages[0]}
                      alt={listing.itemName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${rarityColor[listing.itemRarity]}`}>
                      {rarityLabel[listing.itemRarity]}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {listing.itemName}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs text-purple-600">
                      {listing.sellerNickname?.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-400">{listing.sellerNickname}</span>
                    <span className="text-xs text-amber-500">★ {Number(listing.sellerScore).toFixed(1)}</span>
                  </div>
                  <p className="text-base font-medium text-purple-600 dark:text-purple-400">
                    {formatVND(listing.askingPrice)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={data?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}