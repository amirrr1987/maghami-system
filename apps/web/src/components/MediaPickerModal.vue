<script setup lang="ts">
import { FolderOpenOutlined, HomeOutlined } from '@ant-design/icons-vue'
import {
  Empty,
  Flex,
  Input,
  Modal,
  Spin,
  Tree,
  TypographyText,
  message,
} from 'ant-design-vue'
import type { DataNode } from 'ant-design-vue/es/tree'
import type {
  FileFolderDto,
  StoredFile,
} from '@maghami-system/schemas'
import { computed, h, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { filesApi } from '@/api/files.api'
import { ApiError } from '@/api/types'

const props = withDefaults(
  defineProps<{
    open: boolean
    multiple?: boolean
    maxCount?: number
    selectedIds?: string[]
  }>(),
  {
    multiple: false,
    maxCount: 12,
    selectedIds: () => [],
  },
)

const emit = defineEmits<{
  'update:open': [open: boolean]
  confirm: [ids: string[]]
}>()

const loading = ref(false)
const folders = ref<FileFolderDto[]>([])
const files = ref<StoredFile[]>([])
const total = ref(0)
const currentFolderId = ref<string | null>(null)
const search = ref('')
const draftIds = ref<string[]>([])
const previewById = reactive<Record<string, string>>({})
const expandedKeys = ref<string[]>(['root'])

const canConfirm = computed(() => draftIds.value.length > 0)
const title = computed(() =>
  props.multiple ? 'انتخاب تصاویر از کتابخانه' : 'انتخاب تصویر از کتابخانه',
)

const selectedFolderKeys = computed(() => [
  currentFolderId.value ?? 'root',
])

const folderTreeData = computed((): DataNode[] => {
  const byParent = new Map<string | null, FileFolderDto[]>()
  for (const folder of folders.value) {
    const key = folder.parentId
    const list = byParent.get(key) ?? []
    list.push(folder)
    byParent.set(key, list)
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name, 'fa'))
  }

  function childrenOf(parentId: string | null): DataNode[] {
    return (byParent.get(parentId) ?? []).map((folder) => ({
      key: folder.id,
      title: folder.name,
      icon: () => h(FolderOpenOutlined),
      children: childrenOf(folder.id),
    }))
  }

  return [
    {
      key: 'root',
      title: 'همه فایل‌ها',
      icon: () => h(HomeOutlined),
      children: childrenOf(null),
    },
  ]
})

function revokePreviews(): void {
  for (const url of Object.values(previewById)) {
    URL.revokeObjectURL(url)
  }
  for (const key of Object.keys(previewById)) {
    delete previewById[key]
  }
}

onBeforeUnmount(() => {
  revokePreviews()
})

async function loadFolders(): Promise<void> {
  try {
    folders.value = await filesApi.listFolders()
  } catch (error) {
    message.error(
      error instanceof ApiError ? error.message : 'بارگذاری پوشه‌ها ناموفق بود',
    )
  }
}

async function loadFiles(): Promise<void> {
  loading.value = true
  try {
    const result = await filesApi.list({
      page: 1,
      pageSize: 48,
      q: search.value.trim() || undefined,
      folderId: currentFolderId.value,
    })
    files.value = result.items
    total.value = result.total
    await loadMissingPreviews(result.items)
  } catch (error) {
    message.error(
      error instanceof ApiError ? error.message : 'بارگذاری فایل‌ها ناموفق بود',
    )
  } finally {
    loading.value = false
  }
}

async function loadMissingPreviews(rows: StoredFile[]): Promise<void> {
  await Promise.all(
    rows.map(async (row) => {
      if (previewById[row.id]) return
      try {
        const blob = await filesApi.fetchBlob(row.id)
        previewById[row.id] = URL.createObjectURL(blob)
      } catch {
        // leave empty
      }
    }),
  )
}

watch(
  () => props.open,
  (open) => {
    if (!open) {
      revokePreviews()
      files.value = []
      return
    }
    draftIds.value = [...props.selectedIds]
    currentFolderId.value = null
    search.value = ''
    expandedKeys.value = ['root']
    void (async () => {
      await loadFolders()
      await loadFiles()
    })()
  },
)

function close(): void {
  emit('update:open', false)
}

function onTreeSelect(keys: (string | number)[]): void {
  const key = keys[0]
  if (key === undefined) return
  const id = String(key)
  currentFolderId.value = id === 'root' ? null : id
  search.value = ''
  void loadFiles()
}

function onTreeExpand(keys: (string | number)[]): void {
  expandedKeys.value = keys.map(String)
}

function onSearch(value: string): void {
  search.value = value
  void loadFiles()
}

function isSelected(id: string): boolean {
  return draftIds.value.includes(id)
}

function toggle(id: string): void {
  if (props.multiple) {
    if (isSelected(id)) {
      draftIds.value = draftIds.value.filter((row) => row !== id)
      return
    }
    if (draftIds.value.length >= props.maxCount) {
      message.error(`حداکثر ${props.maxCount} تصویر`)
      return
    }
    draftIds.value = [...draftIds.value, id]
    return
  }
  draftIds.value = [id]
}

function onOk(): void {
  if (!canConfirm.value) {
    message.warning('حداقل یک تصویر انتخاب کنید')
    return
  }
  emit('confirm', [...draftIds.value])
  close()
}
</script>

<template>
  <Modal
    :open="open"
    :title="title"
    width="840px"
    destroy-on-close
    ok-text="انتخاب"
    cancel-text="انصراف"
    :ok-button-props="{ disabled: !canConfirm }"
    @update:open="emit('update:open', $event)"
    @ok="onOk"
    @cancel="close"
  >
    <Flex gap="16" align="stretch" class="min-h-80">
      <div class="w-52 shrink-0">
        <TypographyText strong class="mb-2 block">پوشه‌ها</TypographyText>
        <Tree
          block-node
          show-icon
          :tree-data="folderTreeData"
          :selected-keys="selectedFolderKeys"
          :expanded-keys="expandedKeys"
          class="bg-transparent!"
          @select="onTreeSelect"
          @expand="onTreeExpand"
        />
      </div>

      <div class="min-w-0 flex-1">
        <Flex
          class="mb-3"
          wrap="wrap"
          gap="12"
          align="center"
          justify="space-between"
        >
          <Input.Search
            :value="search"
            placeholder="جستجو در این پوشه"
            allow-clear
            class="max-w-70"
            @search="onSearch"
            @change="
              (e: Event) => (search = (e.target as HTMLInputElement).value)
            "
          />
          <TypographyText type="secondary">
            {{ draftIds.length }}
            <template v-if="multiple"> / {{ maxCount }}</template>
            انتخاب · {{ total }} مورد
          </TypographyText>
        </Flex>

        <Spin :spinning="loading">
          <Empty
            v-if="!loading && files.length === 0"
            description="فایلی در این پوشه نیست — از مدیریت فایل‌ها آپلود کنید"
          />
          <div
            v-else
            class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
          >
            <button
              v-for="file in files"
              :key="file.id"
              type="button"
              class="relative overflow-hidden rounded border p-0 text-start"
              :class="
                isSelected(file.id)
                  ? 'border-blue-500 ring-2 ring-blue-500/40'
                  : 'border-neutral-200 dark:border-neutral-700'
              "
              @click="toggle(file.id)"
            >
              <div
                class="flex h-24 items-center justify-center bg-neutral-100 dark:bg-neutral-800"
              >
                <img
                  v-if="previewById[file.id]"
                  :src="previewById[file.id]"
                  :alt="file.alt || file.title || file.originalName"
                  class="h-full w-full object-cover"
                />
                <TypographyText v-else type="secondary" class="text-xs">
                  …
                </TypographyText>
              </div>
              <div class="truncate px-2 py-1 text-xs">
                {{ file.title || file.originalName }}
              </div>
            </button>
          </div>
        </Spin>
      </div>
    </Flex>
  </Modal>
</template>
