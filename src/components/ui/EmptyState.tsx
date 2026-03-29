interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
    </div>
    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-400 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)