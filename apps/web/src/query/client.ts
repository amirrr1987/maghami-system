import { QueryCache, QueryClient } from '@tanstack/vue-query'
import { notifyApiError } from '@/api/notify-api-error'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      notifyApiError(
        error,
        query.meta?.errorMessage ?? 'بارگذاری ناموفق بود',
      )
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
