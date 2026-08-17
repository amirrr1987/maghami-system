import { message } from 'ant-design-vue'
import { ApiError } from './types'

export function notifyApiError(error: unknown, fallback: string): void {
  if (error instanceof ApiError) {
    message.error(error.message)
    return
  }
  message.error(fallback)
}
