export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} border-2 border-purple-600 border-t-transparent rounded-full animate-spin`} />
  )
}

export const PageSpinner = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <Spinner size="lg" />
  </div>
)