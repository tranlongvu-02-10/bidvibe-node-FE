import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotificationStore } from '../../store/notificationStore'
import { formatVND } from '../../utils/format'
import { useWalletStore } from '../../store/walletStore'
import { Bell, ChevronDown, Menu, X, Sun, Moon } from 'lucide-react'
import { useDarkMode } from '../../hooks/useDarkMode'

export const Navbar = () => {
  const { user, logoutUser } = useAuth()
  const { unreadCount } = useNotificationStore()
  const { wallet } = useWalletStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { isDark, toggle } = useDarkMode()

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-xl font-medium tracking-tight">
          Bid<span className="text-purple-600">Vibe</span>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/sessions" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            Phiên đấu giá
          </Link>
          <Link to="/market" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            Chợ Đen
          </Link>
          <Link to="/items/submit" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            Ký gửi
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Wallet balance */}
              {wallet && (
                <Link
                  to="/me/wallet"
                  className="hidden md:block text-sm font-medium text-purple-600 dark:text-purple-400"
                >
                  {formatVND(wallet.balanceAvailable)}
                </Link>
              )}

              {/* Dark mode toggle */}
              <button
                onClick={toggle}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark
                  ? <Sun  size={15} className="text-amber-400" />
                  : <Moon size={15} className="text-gray-500"  />
                }
              </button>

              {/* Bell */}
              <Link to="/me/notifications" className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Bell size={16} className="text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-gray-950" />
                )}
              </Link>

              {/* Avatar dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-medium">
                    {user.nickname?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.nickname}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    {[
                      { label: 'Hồ sơ cá nhân', to: '/me/profile' },
                      { label: 'Kho đồ',         to: '/me/inventory' },
                      { label: 'Ví tiền',         to: '/me/wallet' },
                      { label: 'Watchlist',       to: '/me/watchlist' },
                      ...(user.role === 'ADMIN' ? [{ label: 'Admin Panel', to: '/admin' }] : []),
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setDropdownOpen(false)}
                        className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1">
                      <button
                        onClick={() => { logoutUser(); setDropdownOpen(false) }}
                        className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Đăng nhập
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex flex-col gap-3">
          <Link to="/sessions" className="text-sm text-gray-600 dark:text-gray-300" onClick={() => setMenuOpen(false)}>Phiên đấu giá</Link>
          <Link to="/market"   className="text-sm text-gray-600 dark:text-gray-300" onClick={() => setMenuOpen(false)}>Chợ Đen</Link>
          <Link to="/items/submit" className="text-sm text-gray-600 dark:text-gray-300" onClick={() => setMenuOpen(false)}>Ký gửi</Link>
        </div>
      )}
    </nav>
  )
}