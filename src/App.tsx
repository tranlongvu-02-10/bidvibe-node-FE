import { Routes, Route } from 'react-router-dom'
import { Layout }                from './components/layout/Layout'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

// Public pages
import { LoginPage }         from './pages/LoginPage'
import { AuthCallbackPage }  from './pages/AuthCallbackPage'

// Main pages
import { HomePage }          from './pages/HomePage'
import { SessionListPage }   from './pages/SessionListPage'
import { SessionDetailPage } from './pages/SessionDetailPage'
import { AuctionRoomPage }   from './pages/AuctionRoomPage'
import { MarketPage }        from './pages/MarketPage'
import { ListingDetailPage } from './pages/ListingDetailPage'
import { PublicProfilePage } from './pages/PublicProfilePage'

// Protected pages
import { WalletPage }        from './pages/WalletPage'
import { ProfilePage }       from './pages/ProfilePage'
import { InventoryPage }     from './pages/InventoryPage'

import { NotificationsPage } from './pages/NotificationsPage'
import { WatchlistPage }     from './pages/WatchlistPage'
import { SubmitItemPage }    from './pages/SubmitItemPage'

const PlaceholderPage = ({ name }: { name: string }) => (
  <div className="max-w-7xl mx-auto px-4 py-12">
    <h2 className="text-2xl font-medium text-gray-400">{name}</h2>
    <p className="text-gray-400 mt-2">Đang phát triển...</p>
  </div>
)

function App() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────── */}
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* ── Main layout ────────────────────────────────── */}
      <Route element={<Layout />}>

        {/* Public routes */}
        <Route path="/"             element={<HomePage />} />
        <Route path="/sessions"     element={<SessionListPage />} />
        <Route path="/sessions/:id" element={<SessionDetailPage />} />
        <Route path="/auctions/:id" element={<AuctionRoomPage />} />
        <Route path="/market"       element={<MarketPage />} />
        <Route path="/market/:id"   element={<ListingDetailPage />} />
        <Route path="/users/:id"    element={<PublicProfilePage />} />
        <Route path="/items/:id"    element={<PlaceholderPage name="Chi tiết vật phẩm" />} />

        {/* Protected routes */}
        <Route path="/me/notifications"
          element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}
        />
        <Route path="/me/watchlist"
          element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>}
        />
        <Route path="/items/submit"
          element={<ProtectedRoute><SubmitItemPage /></ProtectedRoute>}
        />
        
        <Route path="/me/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
        <Route path="/me/wallet"
          element={<ProtectedRoute><WalletPage /></ProtectedRoute>}
        />
        <Route path="/me/inventory"
          element={<ProtectedRoute><InventoryPage /></ProtectedRoute>}
        />
        <Route path="/me/ratings"
          element={<ProtectedRoute><PlaceholderPage name="Đánh giá" /></ProtectedRoute>}
        />

        {/* Admin routes */}
        <Route path="/admin"
          element={<AdminRoute><PlaceholderPage name="Admin Dashboard" /></AdminRoute>}
        />
        <Route path="/admin/items"
          element={<AdminRoute><PlaceholderPage name="Quản lý vật phẩm" /></AdminRoute>}
        />
        <Route path="/admin/sessions"
          element={<AdminRoute><PlaceholderPage name="Quản lý phiên đấu giá" /></AdminRoute>}
        />
        <Route path="/admin/sessions/:id"
          element={<AdminRoute><PlaceholderPage name="Chi tiết phiên" /></AdminRoute>}
        />
        <Route path="/admin/users"
          element={<AdminRoute><PlaceholderPage name="Quản lý người dùng" /></AdminRoute>}
        />
        <Route path="/admin/transactions"
          element={<AdminRoute><PlaceholderPage name="Duyệt tài chính" /></AdminRoute>}
        />
        <Route path="/admin/analytics"
          element={<AdminRoute><PlaceholderPage name="Thống kê" /></AdminRoute>}
        />

      </Route>
    </Routes>
  )
}

export default App