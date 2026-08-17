<script setup lang="ts">
import {
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
} from '@ant-design/icons-vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  InputNumber,
  Modal,
  Segmented,
  Space,
  message,
} from 'ant-design-vue'
import {
  IMAGE_UPLOAD,
  isAllowedImageMime,
  uploadFileMetaSchema,
  type UploadFileMetaDto,
} from '@maghami-system/schemas'
import {
  CircleStencil,
  Cropper,
  type CropperResult,
} from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import {
  computed,
  markRaw,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
  type Component,
  type ComponentPublicInstance,
} from 'vue'
import { canvasToImageFile } from '@/utils/canvas-to-image-file'

type CropperExposed = {
  getResult: () => CropperResult
  rotate: (angle: number) => void
  flip: (horizontal: boolean, vertical?: boolean) => void
  reset: () => void
}

/** Mutually exclusive crop constraint modes. */
type CropMode = 'free' | 'aspect' | 'size' | 'bounds' | 'circle'

type AspectRatioKey = '1:1' | '4:3' | '3:4' | '16:9' | '9:16'

const CROP_MODE_OPTIONS: { value: CropMode; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: 'aspect', label: 'Aspect' },
  { value: 'size', label: 'W / H' },
  { value: 'bounds', label: 'Min / Max' },
  { value: 'circle', label: 'Circle' },
]

const ASPECT_PRESETS: { key: AspectRatioKey; label: string }[] = [
  { key: '1:1', label: '۱:۱' },
  { key: '4:3', label: '۴:۳' },
  { key: '3:4', label: '۳:۴' },
  { key: '16:9', label: '۱۶:۹' },
  { key: '9:16', label: '۹:۱۶' },
]

const ASPECT_MAP: Record<AspectRatioKey, number> = {
  '1:1': 1,
  '4:3': 4 / 3,
  '3:4': 3 / 4,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
}

const open = defineModel<boolean>('open', { required: true })

const props = withDefaults(
  defineProps<{
    src: string | null
    fileName?: string
    outputMime?: string
    confirmLoading?: boolean
  }>(),
  {
    fileName: 'image.jpg',
    outputMime: 'image/jpeg',
    confirmLoading: false,
  },
)

const emit = defineEmits<{
  confirm: [payload: { file: File; meta: UploadFileMetaDto }]
}>()

const cropperRef = ref<(ComponentPublicInstance & CropperExposed) | null>(
  null,
)

const meta = reactive({
  title: '',
  alt: '',
})

const cropMode = ref<CropMode>('free')
const aspectRatioKey = ref<AspectRatioKey>('1:1')
const outputWidth = ref<number | null>(null)
const outputHeight = ref<number | null>(null)
const minWidth = ref<number | null>(null)
const minHeight = ref<number | null>(null)
const maxWidth = ref<number | null>(null)
const maxHeight = ref<number | null>(null)

const cropperKey = computed(
  () => `${cropMode.value}:${aspectRatioKey.value}`,
)

const stencilComponent = computed((): Component | undefined => {
  if (cropMode.value === 'circle') {
    return markRaw(CircleStencil) as Component
  }
  return undefined
})

const stencilProps = computed(() => {
  if (cropMode.value === 'aspect') {
    return { aspectRatio: ASPECT_MAP[aspectRatioKey.value] }
  }
  if (cropMode.value === 'circle') {
    return { aspectRatio: 1 }
  }
  return {}
})

const sizeRestrictions = computed(() => {
  if (cropMode.value !== 'bounds') {
    return {
      minWidth: 50,
      minHeight: 50,
      maxWidth: 10_000,
      maxHeight: 10_000,
    }
  }
  return {
    minWidth: minWidth.value ?? 50,
    minHeight: minHeight.value ?? 50,
    maxWidth: maxWidth.value ?? 10_000,
    maxHeight: maxHeight.value ?? 10_000,
  }
})

function baseNameFromFile(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '') || 'image'
}

function resetForm(fileName: string): void {
  meta.title = baseNameFromFile(fileName)
  meta.alt = ''
  cropMode.value = 'free'
  aspectRatioKey.value = '1:1'
  outputWidth.value = null
  outputHeight.value = null
  minWidth.value = null
  minHeight.value = null
  maxWidth.value = null
  maxHeight.value = null
}

watch(open, (value) => {
  if (!value) {
    cropperRef.value = null
    return
  }
  resetForm(props.fileName)
})

watch(
  () => props.fileName,
  (name) => {
    if (open.value) resetForm(name)
  },
)

onBeforeUnmount(() => {
  cropperRef.value = null
})

function onCancel(): void {
  open.value = false
}

function rotate(angle: number): void {
  cropperRef.value?.rotate(angle)
}

function flipHorizontal(): void {
  cropperRef.value?.flip(true, false)
}

function flipVertical(): void {
  cropperRef.value?.flip(false, true)
}

function onCropModeChange(value: string | number): void {
  cropMode.value = String(value) as CropMode
}

async function onConfirm(): Promise<void> {
  const parsed = uploadFileMetaSchema.safeParse({
    title: meta.title,
    alt: meta.alt,
  })
  if (!parsed.success) {
    message.error('عنوان الزامی است')
    return
  }

  if (cropMode.value === 'size') {
    if (outputWidth.value == null || outputHeight.value == null) {
      message.error('عرض و ارتفاع خروجی را وارد کنید')
      return
    }
  }

  if (cropMode.value === 'bounds') {
    if (
      minWidth.value != null &&
      maxWidth.value != null &&
      minWidth.value > maxWidth.value
    ) {
      message.error('حداقل عرض از حداکثر بیشتر است')
      return
    }
    if (
      minHeight.value != null &&
      maxHeight.value != null &&
      minHeight.value > maxHeight.value
    ) {
      message.error('حداقل ارتفاع از حداکثر بیشتر است')
      return
    }
  }

  const result = cropperRef.value?.getResult()
  const canvas = result?.canvas
  if (!canvas) {
    message.error('ابتدا تصویر را برش دهید')
    return
  }

  const mime = isAllowedImageMime(props.outputMime)
    ? props.outputMime
    : 'image/jpeg'
  try {
    const file = await canvasToImageFile(canvas, props.fileName, mime, {
      outputWidth: cropMode.value === 'size' ? outputWidth.value : null,
      outputHeight: cropMode.value === 'size' ? outputHeight.value : null,
    })
    if (file.size > IMAGE_UPLOAD.maxBytes) {
      message.error(
        `حجم پس از برش بیش از ${Math.round(IMAGE_UPLOAD.maxBytes / (1024 * 1024))}MB است`,
      )
      return
    }
    emit('confirm', { file, meta: parsed.data })
  } catch {
    message.error('برش تصویر ناموفق بود')
  }
}
</script>

<template>
  <Modal
    v-model:open="open"
    title="برش و مشخصات تصویر"
    :width="800"
    destroy-on-close
    :footer="null"
    @cancel="onCancel"
  >
    <div
      v-if="src"
      class="mb-3 h-80 overflow-hidden rounded border border-neutral-200 bg-neutral-900"
    >
      <Cropper
        :key="cropperKey"
        ref="cropperRef"
        class="h-full w-full"
        :src="src"
        :canvas="true"
        :stencil-component="stencilComponent"
        :stencil-props="stencilProps"
        :size-restrictions="sizeRestrictions"
      />
    </div>

    <Form layout="vertical" class="mb-3">
      <div class="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
        <FormItem label="عنوان (title)" required>
          <Input v-model:value="meta.title" allow-clear />
        </FormItem>
        <FormItem label="متن جایگزین (alt)">
          <Input v-model:value="meta.alt" allow-clear />
        </FormItem>
      </div>

      <FormItem label="حالت برش">
        <Segmented
          block
          :value="cropMode"
          :options="CROP_MODE_OPTIONS"
          @change="onCropModeChange"
        />
      </FormItem>

      <FormItem v-if="cropMode === 'aspect'" label="نسبت">
        <Space wrap>
          <Button
            v-for="preset in ASPECT_PRESETS"
            :key="preset.key"
            size="small"
            :type="aspectRatioKey === preset.key ? 'primary' : 'default'"
            @click="aspectRatioKey = preset.key"
          >
            {{ preset.label }}
          </Button>
        </Space>
      </FormItem>

      <div
        v-else-if="cropMode === 'size'"
        class="grid grid-cols-1 gap-x-3 sm:grid-cols-2"
      >
        <FormItem label="عرض خروجی (px)" required>
          <InputNumber
            v-model:value="outputWidth"
            class="w-full"
            :min="1"
            :precision="0"
          />
        </FormItem>
        <FormItem label="ارتفاع خروجی (px)" required>
          <InputNumber
            v-model:value="outputHeight"
            class="w-full"
            :min="1"
            :precision="0"
          />
        </FormItem>
      </div>

      <div
        v-else-if="cropMode === 'bounds'"
        class="grid grid-cols-2 gap-x-3 sm:grid-cols-4"
      >
        <FormItem label="حداقل عرض">
          <InputNumber
            v-model:value="minWidth"
            class="w-full"
            :min="1"
            :precision="0"
            placeholder="—"
          />
        </FormItem>
        <FormItem label="حداقل ارتفاع">
          <InputNumber
            v-model:value="minHeight"
            class="w-full"
            :min="1"
            :precision="0"
            placeholder="—"
          />
        </FormItem>
        <FormItem label="حداکثر عرض">
          <InputNumber
            v-model:value="maxWidth"
            class="w-full"
            :min="1"
            :precision="0"
            placeholder="—"
          />
        </FormItem>
        <FormItem label="حداکثر ارتفاع">
          <InputNumber
            v-model:value="maxHeight"
            class="w-full"
            :min="1"
            :precision="0"
            placeholder="—"
          />
        </FormItem>
      </div>
    </Form>

    <Space wrap class="mb-4">
      <Button @click="rotate(-90)">
        <template #icon>
          <RotateLeftOutlined />
        </template>
        چرخش
      </Button>
      <Button @click="rotate(90)">
        <template #icon>
          <RotateRightOutlined />
        </template>
        چرخش
      </Button>
      <Button @click="flipHorizontal">
        <template #icon>
          <SwapOutlined />
        </template>
        آینه افقی
      </Button>
      <Button @click="flipVertical">
        <template #icon>
          <SwapOutlined :rotate="90" />
        </template>
        آینه عمودی
      </Button>
    </Space>
    <Space class="w-full justify-end">
      <Button @click="onCancel">انصراف</Button>
      <Button type="primary" :loading="confirmLoading" @click="onConfirm">
        آپلود
      </Button>
    </Space>
  </Modal>
</template>
