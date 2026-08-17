import type { ApiError } from '@/api/types'

declare module '@tanstack/vue-query' {
  interface Register {
    defaultError: ApiError
    queryMeta: {
      errorMessage?: string
    }
  }
}
