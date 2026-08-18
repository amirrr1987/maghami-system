<script setup lang="ts">
import { DeleteOutlined, PictureOutlined, StarFilled, StarOutlined } from '@ant-design/icons-vue'
import { Button, Flex } from 'ant-design-vue'
import { onBeforeUnmount, reactive, ref, watch } from 'vue'
import MediaPickerModal from '@/components/MediaPickerModal.vue'
import { filesApi } from '@/api/files.api'

export interface ImageUploadItem {
  fileId: string
  previewUrl: string
  isCover: boolean
}

const props = withDefaults(
  defineProps<{
    fileIds: string[]
    coverFileId: string | null
    multiple?: boolean
    maxCount?: number
    disabled?: boolean
    /** `logo`: 128px square, contain (brand marks). Default: 96px cover. */
    variant?: 'default' | 'logo'
  }>(),
  {
    multiple: true,
    maxCount: 12,
    disabled: false,
    variant: 'default',
  },
)

const emit = defineEmits<{
  'update:fileIds': [ids: string[]]
  'update:coverFileId': [id: string | null]
}>()

const items = reactive<ImageUploadItem[]>([])
const pickerOpen = ref(false)

watch(
  () => [props.fileIds.join(','), props.coverFileId] as const,
  async () => {
    const nextIds = props.fileIds
    const keep = new Set(nextIds)
    const stale = items.filter((item) => !keep.has(item.fileId))
    for (const item of stale) {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
      const index = items.findIndex((row) => row.fileId === item.fileId)
      if (index >= 0) items.splice(index, 1)
    }
    for (const id of nextIds) {
      if (items.some((row) => row.fileId === id)) continue
      try {
        const blob = await filesApi.fetchBlob(id)
        items.push({
          fileId: id,
          previewUrl: URL.createObjectURL(blob),
          isCover: props.coverFileId === id,
        })
      } catch {
        items.push({
          fileId: id,
          previewUrl: '',
          isCover: props.coverFileId === id,
        })
      }
    }
    for (const item of items) {
      item.isCover = props.coverFileId === item.fileId
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  for (const item of items) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
  }
})

function emitState(ids: string[], cover: string | null): void {
  emit('update:fileIds', ids)
  emit('update:coverFileId', cover)
}

function openPicker(): void {
  if (props.disabled) return
  pickerOpen.value = true
}

function onPickerConfirm(ids: string[]): void {
  const nextIds = props.multiple ? ids : ids.slice(0, 1)
  const nextCover =
    props.coverFileId && nextIds.includes(props.coverFileId)
      ? props.coverFileId
      : (nextIds[0] ?? null)
  emitState(nextIds, nextCover)
}

function removeItem(fileId: string): void {
  const item = items.find((row) => row.fileId === fileId)
  if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
  const index = items.findIndex((row) => row.fileId === fileId)
  if (index >= 0) items.splice(index, 1)
  const nextIds = props.fileIds.filter((id) => id !== fileId)
  let nextCover = props.coverFileId
  if (nextCover === fileId) {
    nextCover = nextIds[0] ?? null
  }
  emitState(nextIds, nextCover)
}

function setCover(fileId: string): void {
  emit('update:coverFileId', fileId)
  for (const item of items) {
    item.isCover = item.fileId === fileId
  }
}

const previewBoxClass =
  props.variant === 'logo'
    ? 'relative h-32 w-32 overflow-hidden rounded border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900'
    : 'relative h-24 w-24 overflow-hidden rounded border border-neutral-200 dark:border-neutral-700'

const previewImgClass =
  props.variant === 'logo' ? 'h-full w-full object-contain p-2' : 'h-full w-full object-cover'
</script>

<template>
  <div>
    <Flex wrap="wrap" gap="8" align="center" class="mb-2">
      <Button type="default" :disabled="disabled" @click="openPicker">
        <template #icon>
          <PictureOutlined />
        </template>
        انتخاب از کتابخانه
      </Button>
    </Flex>

    <Flex v-if="items.length > 0" wrap="wrap" :gap="12">
      <div
        v-for="item in items"
        :key="item.fileId"
        :class="previewBoxClass"
      >
        <img
          v-if="item.previewUrl"
          :src="item.previewUrl"
          alt=""
          :class="previewImgClass"
        />
        <div class="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1">
          <Button
            v-if="multiple"
            type="text"
            size="small"
            class="text-white!"
            :aria-label="item.isCover ? 'کاور' : 'انتخاب کاور'"
            @click="setCover(item.fileId)"
          >
            <StarFilled v-if="item.isCover" class="text-amber-300" />
            <StarOutlined v-else />
          </Button>
          <Button
            type="text"
            size="small"
            danger
            aria-label="حذف از انتخاب"
            :disabled="disabled"
            @click="removeItem(item.fileId)"
          >
            <DeleteOutlined />
          </Button>
        </div>
      </div>
    </Flex>

    <MediaPickerModal
      v-model:open="pickerOpen"
      :multiple="multiple"
      :max-count="maxCount"
      :selected-ids="fileIds"
      @confirm="onPickerConfirm"
    />
  </div>
</template>
