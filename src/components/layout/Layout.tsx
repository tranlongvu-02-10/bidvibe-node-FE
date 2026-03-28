import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export const Layout = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Navbar />
    <main>
      <Outlet />
    </main>
  </div>
)