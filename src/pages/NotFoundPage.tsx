import { Link } from 'react-router-dom'

export const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <div className="text-center">
      <p className="text-8xl font-medium text-gray-200 dark:text-gray-800">404</p>
      <h1 className="text-2xl font-medium text-gray-900 dark:text-white mt-4 mb-2">
        Trang không tồn tại
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        Đường dẫn này không tồn tại hoặc đã bị xóa.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 transition-colors"
      >
        Về trang chủ
      </Link>
    </div>
  </div>
)