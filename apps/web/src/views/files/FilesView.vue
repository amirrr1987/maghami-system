<script setup lang="ts">
import {
  ArrowUpOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileImageOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  HddOutlined,
  HomeOutlined,
  MoreOutlined,
} from '@ant-design/icons-vue'
import { Can } from '@casl/vue'
import {
  Alert,
  Avatar,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardMeta,
  Checkbox,
  Col,
  Descriptions,
  DescriptionsItem,
  Dropdown,
  Empty,
  Flex,
  Form,
  FormItem,
  Image,
  Input,
  InputSearch,
  Menu,
  Modal,
  Pagination,
  Row,
  Space,
  Spin,
  Statistic,
  Tree,
  TypographyParagraph,
  TypographyText,
  Upload,
  message,
} from 'ant-design-vue'
import type { MenuProps, UploadProps } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue/es/form'
import type { DataNode } from 'ant-design-vue/es/tree'
import type { FileFolderDto, StoredFile } from '@maghami-system/schemas'
import {
  IMAGE_UPLOAD,
  isAllowedImageMime,
  PermissionAction,
  PermissionResource,
} from '@maghami-system/schemas'
import {
  computed,
  h,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { storeToRefs } from 'pinia'
import FileThumb from '@/components/FileThumb.vue'
import ImageCropUploadModal from '@/components/ImageCropUploadModal.vue'
import { useAppAbility } from '@/ability'
import { useAuthFileUrl } from '@/composables/useAuthFileUrl'
import { useFileStore } from '@/stores/file.store'
import {
  fileFolderFormRules,
  fileMetaFormRules,
} from '@/validation/file.form-rules'

const { can } = useAppAbility()
const fileStore = useFileStore()
const {
  fileList,
  folders,
  currentFolderId,
  page,
  pageSize,
  total,
  search,
  loading,
  saving,
  stats,
  selectedIds,
} = storeToRefs(fileStore)

const cropOpen = ref(false)
const cropSrc = ref<string | null>(null)
const cropFileName = ref('image.jpg')

const previewFile = ref<StoredFile | null>(null)
const previewIdRef = computed(() => previewFile.value?.id ?? null)
const { url: previewUrl } = useAuthFileUrl(previewIdRef)

const folderModalOpen = ref(false)
const folderFormRef = ref<FormInstance>()
const folderForm = reactive({ name: '' })
const editingFolderId = ref<string | null>(null)
/** Parent for new folder (null = library root). */
const createParentId = ref<string | null>(null)

const metaModalOpen = ref(false)
const metaFormRef = ref<FormInstance>()
const metaForm = reactive({ title: '', alt: '' })
const metaEditingFile = ref<StoredFile | null>(null)

const expandedKeys = ref<string[]>(['root'])

const canCreate = computed(() =>
  can(PermissionAction.Create, PermissionResource.Files),
)
const canUpdate = computed(() =>
  can(PermissionAction.Update, PermissionResource.Files),
)
const canDelete = computed(() =>
  can(PermissionAction.Delete, PermissionResource.Files),
)

const selectedFolderKeys = computed(() => [
  currentFolderId.value ?? 'root',
])

const folderById = computed(() => {
  const map = new Map<string, FileFolderDto>()
  for (const folder of folders.value) {
    map.set(folder.id, folder)
  }
  return map
})

const breadcrumbTrail = computed(() => {
  const trail: FileFolderDto[] = []
  let id = currentFolderId.value
  while (id) {
    const folder = folderById.value.get(id)
    if (!folder) break
    trail.unshift(folder)
    id = folder.parentId
  }
  return trail
})

/** Child folders of the current location (Explorer content pane). */
const childFolders = computed(() => {
  const parentId = currentFolderId.value
  const q = search.value.trim().toLowerCase()
  return folders.value
    .filter((folder) => folder.parentId === parentId)
    .filter((folder) =>
      q ? folder.name.toLowerCase().includes(q) : true,
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'fa'))
})

const contentIsEmpty = computed(
  () => childFolders.value.length === 0 && fileList.value.length === 0,
)

const canGoUp = computed(() => currentFolderId.value !== null)

function goUp(): void {
  if (!currentFolderId.value) return
  const parent =
    folderById.value.get(currentFolderId.value)?.parentId ?? null
  void fileStore.selectFolder(parent)
}

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

function folderPathLabel(folderId: string): string {
  const parts: string[] = []
  let id: string | null = folderId
  while (id) {
    const folder = folderById.value.get(id)
    if (!folder) break
    parts.unshift(folder.name)
    id = folder.parentId
  }
  return parts.join(' / ')
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('fa-IR')
}

function openEditMeta(file: StoredFile): void {
  metaEditingFile.value = file
  metaForm.title = file.title || file.originalName
  metaForm.alt = file.alt || ''
  metaModalOpen.value = true
}

async function submitMeta(): Promise<void> {
  const file = metaEditingFile.value
  if (!file) return
  try {
    await metaFormRef.value?.validate()
  } catch {
    return
  }
  const ok = await fileStore.updateMeta(file.id, {
    title: metaForm.title.trim(),
    alt: metaForm.alt.trim(),
  })
  if (ok) metaModalOpen.value = false
}

function confirmBulkDelete(): void {
  const ids = [...selectedIds.value]
  if (ids.length === 0) return
  Modal.confirm({
    title: `${ids.length} فایل حذف شود؟`,
    okText: 'حذف',
    okType: 'danger',
    cancelText: 'انصراف',
    onOk: () => fileStore.bulkRemove(ids),
  })
}

function revokeCropSrc(): void {
  if (cropSrc.value) {
    URL.revokeObjectURL(cropSrc.value)
    cropSrc.value = null
  }
}

function openPreview(file: StoredFile): void {
  previewFile.value = file
}

function closePreview(): void {
  previewFile.value = null
}

async function removeFile(file: StoredFile): Promise<void> {
  if (!canDelete.value) return
  await fileStore.remove(file.id)
}

function confirmDeleteFile(file: StoredFile): void {
  Modal.confirm({
    title: 'این فایل حذف شود؟',
    okText: 'حذف',
    okType: 'danger',
    cancelText: 'انصراف',
    onOk: async () => {
      await removeFile(file)
      if (previewFile.value?.id === file.id) closePreview()
    },
  })
}

function openCreateFolder(parentId: string | null = null): void {
  editingFolderId.value = null
  createParentId.value = parentId
  folderForm.name = ''
  folderModalOpen.value = true
}

function openRenameFolder(folder: FileFolderDto): void {
  editingFolderId.value = folder.id
  createParentId.value = folder.parentId
  folderForm.name = folder.name
  folderModalOpen.value = true
}

async function submitFolder(): Promise<void> {
  try {
    await folderFormRef.value?.validate()
  } catch {
    return
  }
  const name = folderForm.name.trim()
  const parentForExpand = createParentId.value
  const ok = editingFolderId.value
    ? await fileStore.renameFolder(editingFolderId.value, { name })
    : await fileStore.createFolder({
        name,
        parentId: createParentId.value,
      })
  if (ok) {
    folderModalOpen.value = false
    const next = new Set(expandedKeys.value)
    next.add('root')
    if (parentForExpand) next.add(parentForExpand)
    expandedKeys.value = [...next]
  }
}

async function removeFolder(folder: FileFolderDto): Promise<void> {
  await fileStore.removeFolder(folder.id)
}

function confirmDeleteFolder(folder: FileFolderDto): void {
  Modal.confirm({
    title: `پوشه «${folder.name}» حذف شود؟`,
    content: 'فقط اگر خالی باشد (بدون زیرپوشه و فایل) حذف می‌شود.',
    okText: 'حذف',
    okType: 'danger',
    cancelText: 'انصراف',
    onOk: () => removeFolder(folder),
  })
}

function folderContextItems(key: string): MenuProps['items'] {
  const items: NonNullable<MenuProps['items']> = []
  if (canCreate.value) {
    items.push({
      key: 'create',
      icon: () => h(FolderAddOutlined),
      label: key === 'root' ? 'پوشه جدید' : 'پوشه جدید داخل این',
    })
  }
  if (key !== 'root') {
    if (canUpdate.value) {
      items.push({
        key: 'rename',
        icon: () => h(EditOutlined),
        label: 'تغییر نام',
      })
    }
    if (canDelete.value) {
      items.push({ type: 'divider' })
      items.push({
        key: 'delete',
        danger: true,
        icon: () => h(DeleteOutlined),
        label: 'حذف پوشه',
      })
    }
  }
  return items
}

function onFolderContextAction(
  key: string,
  info: { key: string | number },
): void {
  const action = String(info.key)
  if (action === 'create') {
    if (key !== 'root') void fileStore.selectFolder(key)
    openCreateFolder(key === 'root' ? null : key)
    return
  }
  if (key === 'root') return
  const folder = folderById.value.get(key)
  if (!folder) return
  void fileStore.selectFolder(folder.id)
  if (action === 'rename') {
    openRenameFolder(folder)
    return
  }
  if (action === 'delete') {
    confirmDeleteFolder(folder)
  }
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  if (!can(PermissionAction.Create, PermissionResource.Files)) {
    message.error('مجوز آپلود ندارید')
    return false
  }
  const raw = file as File
  if (!isAllowedImageMime(raw.type)) {
    message.error(`فقط ${IMAGE_UPLOAD.mimeTypes.join('، ')} مجاز است`)
    return false
  }
  if (raw.size > IMAGE_UPLOAD.maxBytes) {
    message.error(
      `حداکثر حجم ${Math.round(IMAGE_UPLOAD.maxBytes / (1024 * 1024))}MB`,
    )
    return false
  }
  revokeCropSrc()
  cropFileName.value = raw.name || 'image.jpg'
  cropSrc.value = URL.createObjectURL(raw)
  cropOpen.value = true
  return false
}

async function onCropConfirm(payload: {
  file: File
  meta: { title: string; alt: string }
}): Promise<void> {
  const ok = await fileStore.upload(payload.file, payload.meta)
  if (ok) {
    cropOpen.value = false
    revokeCropSrc()
  }
}

watch(cropOpen, (value) => {
  if (!value) revokeCropSrc()
})

async function onSearch(value: string): Promise<void> {
  search.value = value
  await fileStore.fetchPage({
    page: 1,
    pageSize: pageSize.value,
    q: value.trim() || undefined,
    folderId: currentFolderId.value,
  })
}

async function onPageChange(next: number, nextSize?: number): Promise<void> {
  await fileStore.fetchPage({
    page: next,
    pageSize: nextSize ?? pageSize.value,
    q: search.value.trim() || undefined,
    folderId: currentFolderId.value,
  })
}

function fileActionItems(file: StoredFile): MenuProps['items'] {
  const items: NonNullable<MenuProps['items']> = [
    {
      key: 'preview',
      icon: () => h(EyeOutlined),
      label: 'مشاهده',
    },
  ]

  if (canUpdate.value) {
    items.push({
      key: 'edit-meta',
      icon: () => h(EditOutlined),
      label: 'ویرایش عنوان / alt',
    })
    const children: NonNullable<MenuProps['items']> = [
      {
        key: 'move:root',
        label: 'همه فایل‌ها',
        disabled: file.folderId === null,
      },
    ]
    for (const folder of folders.value) {
      children.push({
        key: `move:${folder.id}`,
        label: folderPathLabel(folder.id),
        disabled: file.folderId === folder.id,
      })
    }
    items.push({
      key: 'move',
      icon: () => h(FolderOutlined),
      label: 'انتقال به',
      children,
    })
  }

  if (canDelete.value) {
    items.push({ type: 'divider' })
    items.push({
      key: 'delete',
      danger: true,
      icon: () => h(DeleteOutlined),
      label: 'حذف',
    })
  }

  return items
}

async function onFileAction(
  file: StoredFile,
  info: { key: string | number },
): Promise<void> {
  const key = String(info.key)
  if (key === 'preview') {
    openPreview(file)
    return
  }
  if (key === 'edit-meta') {
    openEditMeta(file)
    return
  }
  if (key === 'delete') {
    confirmDeleteFile(file)
    return
  }
  if (key.startsWith('move:')) {
    const target = key.slice('move:'.length)
    await fileStore.moveFile(file.id, target === 'root' ? null : target)
  }
}

function onTreeSelect(keys: (string | number)[]): void {
  const key = keys[0]
  if (key === undefined) return
  const id = String(key)
  void fileStore.selectFolder(id === 'root' ? null : id)
}

function onTreeExpand(keys: (string | number)[]): void {
  expandedKeys.value = keys.map(String)
}

watch(
  currentFolderId,
  (id) => {
    if (!id) return
    const next = new Set(expandedKeys.value)
    next.add('root')
    let walk: string | null = id
    while (walk) {
      next.add(walk)
      walk = folderById.value.get(walk)?.parentId ?? null
    }
    expandedKeys.value = [...next]
  },
  { immediate: true },
)

onMounted(async () => {
  if (!can(PermissionAction.Read, PermissionResource.Files)) return
  await Promise.all([
    fileStore.fetchFolders(),
    fileStore.fetchPage(),
    fileStore.fetchStats(),
  ])
})

onBeforeUnmount(() => {
  revokeCropSrc()
})
</script>

<template>
  <Card title="مدیریت فایل‌ها">
    <template #extra>
      <Space wrap>
        <Button v-if="canGoUp" @click="goUp">
          <template #icon>
            <ArrowUpOutlined />
          </template>
          پوشه بالاتر
        </Button>
        <Can :I="PermissionAction.Create" :a="PermissionResource.Files">
         <Space>
           <Button @click="openCreateFolder(currentFolderId)">
              <template #icon>
                <FolderAddOutlined />
              </template>
              پوشه جدید
            </Button>
            <Upload
              :show-upload-list="false"
              :before-upload="beforeUpload"
              :accept="IMAGE_UPLOAD.mimeTypes.join(',')"
              :disabled="saving"
            >
              <Button
                type="primary"
                :loading="saving"
                :disabled="saving"
              >
                <template #icon>
                  <CloudUploadOutlined />
                </template>
                آپلود تصویر
              </Button>
            </Upload>
         </Space>
        </Can>
      </Space>
    </template>

    <TypographyParagraph type="secondary">
      کتابخانه رسانه — پوشه‌ها و تصاویر
    </TypographyParagraph>

    <Row v-if="stats" :gutter="[16, 16]" class="mb-4">
      <Col :xs="24" :sm="8">
        <Card size="small">
          <Statistic title="فایل‌ها" :value="stats.totalCount">
            <template #prefix>
              <FileImageOutlined />
            </template>
          </Statistic>
        </Card>
      </Col>
      <Col :xs="24" :sm="8">
        <Card size="small">
          <Statistic title="حجم" :value="formatBytes(stats.totalSizeBytes)">
            <template #prefix>
              <HddOutlined />
            </template>
          </Statistic>
        </Card>
      </Col>
      <Col :xs="24" :sm="8">
        <Card size="small">
          <Statistic title="پوشه‌ها" :value="stats.folderCount">
            <template #prefix>
              <FolderOutlined />
            </template>
          </Statistic>
        </Card>
      </Col>
    </Row>

    <Alert
      v-if="selectedIds.length > 0"
      type="info"
      show-icon
      class="mb-4"
      :message="`${selectedIds.length} فایل انتخاب شده`"
    >
      <template #action>
        <Space>
          <Button size="small" @click="fileStore.clearSelection()">
            لغو انتخاب
          </Button>
          <Can :I="PermissionAction.Delete" :a="PermissionResource.Files">
            <Button
              size="small"
              danger
              :loading="saving"
              @click="confirmBulkDelete"
            >
              <template #icon>
                <DeleteOutlined />
              </template>
              حذف
            </Button>
          </Can>
        </Space>
      </template>
    </Alert>

    <Row :gutter="[16, 16]">
      <Col :xs="24" :lg="6">
        <Card size="small" title="درخت پوشه‌ها">
          <Tree
            block-node
            show-icon
            :tree-data="folderTreeData"
            :selected-keys="selectedFolderKeys"
            :expanded-keys="expandedKeys"
            @select="onTreeSelect"
            @expand="onTreeExpand"
          />
        </Card>
      </Col>

      <Col :xs="24" :lg="18">
        <Flex
          align="center"
          justify="space-between"
          wrap="wrap"
          gap="middle"
          class="mb-3"
        >
          <Breadcrumb>
            <BreadcrumbItem>
              <a href="#" @click.prevent="fileStore.selectFolder(null)">
                همه فایل‌ها
              </a>
            </BreadcrumbItem>
            <BreadcrumbItem
              v-for="(crumb, index) in breadcrumbTrail"
              :key="crumb.id"
            >
              <a
                v-if="index < breadcrumbTrail.length - 1"
                href="#"
                @click.prevent="fileStore.selectFolder(crumb.id)"
              >
                {{ crumb.name }}
              </a>
              <template v-else>{{ crumb.name }}</template>
            </BreadcrumbItem>
          </Breadcrumb>
          <TypographyText type="secondary">
            <template v-if="childFolders.length > 0">
              {{ childFolders.length }} پوشه ·
            </template>
            {{ total }} فایل
          </TypographyText>
        </Flex>

        <Row class="mb-4">
          <Col :xs="24" :md="12" :lg="10">
            <InputSearch
              v-model:value="search"
              placeholder="جستجو در این پوشه…"
              allow-clear
              @search="onSearch"
            />
          </Col>
        </Row>

        <Can :I="PermissionAction.Read" :a="PermissionResource.Files">
          <Spin :spinning="loading">
            <Empty
              v-if="!loading && contentIsEmpty"
              description="این پوشه خالی است"
            />

            <div
              v-else
              class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
            >
              <Card
                v-for="folder in childFolders"
                :key="`folder-${folder.id}`"
                hoverable
                size="small"
                @click="fileStore.selectFolder(folder.id)"
              >
                <template #cover>
                  <Flex justify="center" class="p-6">
                    <Avatar shape="square" :size="64">
                      <template #icon>
                        <FolderOpenOutlined />
                      </template>
                    </Avatar>
                  </Flex>
                </template>
                <template
                  v-if="folderContextItems(folder.id)?.length"
                  #actions
                >
                  <Dropdown
                    :trigger="['click']"
                    destroy-popup-on-hide
                    placement="bottomLeft"
                  >
                    <MoreOutlined @click.stop />
                    <template #overlay>
                      <Menu
                        :items="folderContextItems(folder.id)"
                        @click="
                          (info) => onFolderContextAction(folder.id, info)
                        "
                      />
                    </template>
                  </Dropdown>
                </template>
                <CardMeta :title="folder.name" description="پوشه" />
              </Card>

              <Card
                v-for="element in fileList"
                :key="element.id"
                hoverable
                size="small"
                @click="openPreview(element)"
              >
                <template #cover>
                  <Flex justify="center" class="p-6">
                    <FileThumb
                      :file-id="element.id"
                      :size="72"
                      :alt="element.alt"
                    />
                  </Flex>
                </template>
                <template #actions>
                  <Checkbox
                    v-if="canDelete"
                    :checked="selectedIds.includes(element.id)"
                    @click.stop.prevent="fileStore.toggleSelected(element.id)"
                  />
                  <Dropdown
                    :trigger="['click']"
                    destroy-popup-on-hide
                    placement="bottomLeft"
                  >
                    <MoreOutlined @click.stop />
                    <template #overlay>
                      <Menu
                        :items="fileActionItems(element)"
                        @click="(info) => onFileAction(element, info)"
                      />
                    </template>
                  </Dropdown>
                </template>
                <CardMeta
                  :title="element.title || element.originalName"
                  :description="formatBytes(element.sizeBytes)"
                />
              </Card>
            </div>

            <Flex v-if="total > pageSize" justify="end" class="mt-4">
              <Pagination
                :current="page"
                :page-size="pageSize"
                :total="total"
                size="small"
                show-less-items
                @change="onPageChange"
              />
            </Flex>
          </Spin>
        </Can>
      </Col>
    </Row>

    <Modal
      v-model:open="folderModalOpen"
      :title="editingFolderId ? 'تغییر نام پوشه' : 'پوشه جدید'"
      ok-text="ذخیره"
      cancel-text="انصراف"
      :confirm-loading="saving"
      @ok="submitFolder"
    >
      <TypographyParagraph v-if="!editingFolderId" type="secondary">
        <template v-if="createParentId">
          داخل: {{ folderPathLabel(createParentId) }}
        </template>
        <template v-else>در ریشه کتابخانه</template>
      </TypographyParagraph>
      <Form
        ref="folderFormRef"
        layout="vertical"
        :model="folderForm"
        :rules="fileFolderFormRules"
      >
        <FormItem label="نام پوشه" name="name">
          <Input v-model:value="folderForm.name" allow-clear />
        </FormItem>
      </Form>
    </Modal>

    <Modal
      v-model:open="metaModalOpen"
      title="ویرایش مشخصات فایل"
      ok-text="ذخیره"
      cancel-text="انصراف"
      :confirm-loading="saving"
      @ok="submitMeta"
    >
      <TypographyParagraph v-if="metaEditingFile" type="secondary">
        {{ metaEditingFile.originalName }}
      </TypographyParagraph>
      <Form
        ref="metaFormRef"
        layout="vertical"
        :model="metaForm"
        :rules="fileMetaFormRules"
      >
        <FormItem label="عنوان" name="title">
          <Input v-model:value="metaForm.title" allow-clear />
        </FormItem>
        <FormItem label="متن جایگزین (alt)" name="alt">
          <Input v-model:value="metaForm.alt" allow-clear />
        </FormItem>
      </Form>
    </Modal>

    <ImageCropUploadModal
      v-model:open="cropOpen"
      :src="cropSrc"
      :file-name="cropFileName"
      :confirm-loading="saving"
      @confirm="onCropConfirm"
    />

    <Modal
      :open="previewFile !== null"
      :title="previewFile?.title || previewFile?.originalName || 'پیش‌نمایش'"
      width="720px"
      destroy-on-close
      @cancel="closePreview"
    >
      <Flex vertical gap="middle">
        <Image
          v-if="previewUrl"
          :src="previewUrl"
          :alt="previewFile?.alt || previewFile?.title || ''"
          width="100%"
        />
        <TypographyParagraph v-else type="secondary">
          در حال بارگذاری…
        </TypographyParagraph>
        <Descriptions v-if="previewFile" size="small" :column="1">
          <DescriptionsItem label="نام فایل">
            {{ previewFile.originalName }}
          </DescriptionsItem>
          <DescriptionsItem label="حجم">
            {{ formatBytes(previewFile.sizeBytes) }}
          </DescriptionsItem>
          <DescriptionsItem label="تاریخ">
            {{ formatDate(previewFile.createdAt) }}
          </DescriptionsItem>
        </Descriptions>
      </Flex>
      <template #footer>
        <Flex justify="space-between" wrap="wrap" gap="small">
          <Space>
            <Can :I="PermissionAction.Update" :a="PermissionResource.Files">
              <Button
                v-if="previewFile"
                @click="
                  () => {
                    if (previewFile) openEditMeta(previewFile)
                  }
                "
              >
                <template #icon>
                  <EditOutlined />
                </template>
                ویرایش مشخصات
              </Button>
            </Can>
            <Can :I="PermissionAction.Delete" :a="PermissionResource.Files">
              <Button
                v-if="previewFile"
                danger
                @click="
                  () => {
                    if (previewFile) confirmDeleteFile(previewFile)
                  }
                "
              >
                <template #icon>
                  <DeleteOutlined />
                </template>
                حذف
              </Button>
            </Can>
          </Space>
          <Button type="primary" @click="closePreview">بستن</Button>
        </Flex>
      </template>
    </Modal>
  </Card>
</template>
