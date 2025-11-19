/**
 * Reusable loading skeleton components for code-split dynamic imports
 */

export function ChartSkeleton() {
  return (
    <div className="h-64 bg-gray-100 rounded-lg animate-pulse">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-sm text-gray-500">Loading chart...</span>
        </div>
      </div>
    </div>
  )
}

export function RecurrencePickerSkeleton() {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg animate-pulse">
      {/* Pattern Type Selector Skeleton */}
      <div>
        <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>

      {/* Options Skeleton */}
      <div className="bg-white rounded-lg p-4 space-y-3">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-10 w-full bg-gray-200 rounded"></div>
      </div>

      {/* Description Skeleton */}
      <div className="h-12 bg-blue-50 border border-blue-200 rounded-lg"></div>
    </div>
  )
}

export function DraggableListSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-100 border border-gray-200 rounded-lg">
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  )
}

export function ComponentLoadingSkeleton({ message = "Loading component..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
        <span className="text-sm text-gray-500">{message}</span>
      </div>
    </div>
  )
}
