import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { filesApi } from '@/api/files.api'

/**
 * Loads a private file as a blob object URL (revoked on change/unmount).
 */
export function useAuthFileUrl(fileId: Ref<string | null | undefined>) {
  const url = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load(id: string | null | undefined): Promise<void> {
    if (url.value) {
      URL.revokeObjectURL(url.value)
      url.value = null
    }
    error.value = null
    if (!id) {
      loading.value = false
      return
    }
    loading.value = true
    try {
      const blob = await filesApi.fetchBlob(id)
      url.value = URL.createObjectURL(blob)
    } catch {
      error.value = 'بارگذاری تصویر ناموفق بود'
    } finally {
      loading.value = false
    }
  }

  watch(fileId, (id) => void load(id), { immediate: true })

  onBeforeUnmount(() => {
    if (url.value) {
      URL.revokeObjectURL(url.value)
    }
  })

  return { url, loading, error }
}
