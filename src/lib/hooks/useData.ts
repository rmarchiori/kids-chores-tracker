import useSWR from 'swr'

// Shared fetcher function
export const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data')
    throw error
  }
  return res.json()
}

// Hook for pending reviews
export function usePendingReviews() {
  return useSWR('/api/reviews/pending', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  })
}

// Hook for completions with optional filters
export function useCompletions(childId?: string, status?: string, limit: number = 50) {
  const params = new URLSearchParams()
  if (childId) params.append('child_id', childId)
  if (status) params.append('status', status)
  params.append('limit', limit.toString())

  const url = `/api/completions?${params.toString()}`

  return useSWR(url, fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  })
}

// Hook for daily tasks
export function useDailyTasks() {
  return useSWR('/api/tasks/daily', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  })
}
