import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import { LoginPage }        from './pages/LoginPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { HomePage }         from './pages/HomePage'
import { SessionListPage }  from './pages/SessionListPage'
import { SessionDetailPage } from './pages/SessionDetailPage'
import { AuctionRoomPage }   from './pages/AuctionRoomPage'
import { WalletPage }        from './pages/WalletPage'
import { ProfilePage }       from './pages/ProfilePage'
import { PublicProfilePage } from './pages/PublicProfilePage'

// Placeholder pages — sẽ tạo dần các bước tiếp theo
const PlaceholderPage = ({ name }: { name: string }) => (
  <div className="max-w-7xl mx-auto px-4 py-12">
    <h2 className="text-2xl font-medium text-gray-400">{name}</h2>
    <p className="text-gray-400 mt-2">Đang phát triển...</p>
  </div>
)

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Main layout */}
      <Route element={<Layout />}>
        <Route path="/"                element={<HomePage />} />
        <Route path="/sessions" element={<SessionListPage />} />
        <Route path="/sessions/:id" element={<SessionDetailPage />} />
        <Route path="/auctions/:id" element={<AuctionRoomPage />} />
        <Route path="/items/:id"       element={<PlaceholderPage name="Chi tiết vật phẩm" />} />
        <Route path="/items/submit"    element={<PlaceholderPage name="Ký gửi vật phẩm" />} />
        <Route path="/market"          element={<PlaceholderPage name="Chợ Đen" />} />
        <Route path="/market/:id"      element={<PlaceholderPage name="Chi tiết listing" />} />

        {/* Protected */}
        <Route path="/me/wallet"  element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        <Route path="/me/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/users/:id"  element={<PublicProfilePage />} />
        <Route path="/me/profile"   element={<ProtectedRoute><PlaceholderPage name="Hồ sơ" /></ProtectedRoute>} />
        <Route path="/me/inventory" element={<ProtectedRoute><PlaceholderPage name="Kho đồ" /></ProtectedRoute>} />
        <Route path="/me/wallet"    element={<ProtectedRoute><PlaceholderPage name="Ví tiền" /></ProtectedRoute>} />
        <Route path="/me/watchlist" element={<ProtectedRoute><PlaceholderPage name="Watchlist" /></ProtectedRoute>} />
        <Route path="/me/notifications" element={<ProtectedRoute><PlaceholderPage name="Thông báo" /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin"              element={<AdminRoute><PlaceholderPage name="Admin Dashboard" /></AdminRoute>} />
        <Route path="/admin/items"        element={<AdminRoute><PlaceholderPage name="Admin Items" /></AdminRoute>} />
        <Route path="/admin/sessions"     element={<AdminRoute><PlaceholderPage name="Admin Sessions" /></AdminRoute>} />
        <Route path="/admin/users"        element={<AdminRoute><PlaceholderPage name="Admin Users" /></AdminRoute>} />
        <Route path="/admin/transactions" element={<AdminRoute><PlaceholderPage name="Admin Transactions" /></AdminRoute>} />
        <Route path="/admin/analytics"    element={<AdminRoute><PlaceholderPage name="Admin Analytics" /></AdminRoute>} />
      
        
      </Route>
    </Routes>
  )
}

export default App
