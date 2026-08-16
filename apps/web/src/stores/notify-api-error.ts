import { message } from 'ant-design-vue'
import { ApiError } from '@/api/types'

export function notifyApiError(error: unknown, fallback: string): void {
  if (error instanceof ApiError) {
    message.error(error.message)
    return
  }
  message.error(fallback)
}
