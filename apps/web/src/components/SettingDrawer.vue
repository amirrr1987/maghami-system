<script setup lang="ts">
import { CheckOutlined, UndoOutlined } from '@ant-design/icons-vue'
import {
  Divider,
  Drawer,
  Flex,
  Segmented,
  TypographyText,
  Button,
  type Tooltip,
} from 'ant-design-vue'
import type { SegmentedProps } from 'ant-design-vue/es/segmented'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type {
  AppAppearance,
  AppBorderRadius,
  AppCompact,
  AppComponentSize,
  AppFontSize,
} from '@/stores/configProvider.store'
import {
  BORDER_RADIUS_OPTIONS,
  FONT_SIZE_OPTIONS,
  useConfigProviderStore,
} from '@/stores/configProvider.store'
import { palettePrimary, primaryColorPresets } from '@/theme/palettes'

type SegmentedOptions = NonNullable<SegmentedProps['options']>
type SegmentedValue = NonNullable<SegmentedProps['value']>

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const store = useConfigProviderStore()
const { appearance, compact, componentSize, colorPrimary, fontSize, borderRadius } =
  storeToRefs(store)

const appearanceOptions: SegmentedOptions = [
  { label: 'روشن', value: 'light' },
  { label: 'تیره', value: 'dark' },
]

const compactOptions: SegmentedOptions = [
  { label: 'عادی', value: 'default' },
  { label: 'فشرده', value: 'compact' },
]

const sizeOptions: SegmentedOptions = [
  { label: 'کوچک', value: 'small' },
  { label: 'متوسط', value: 'middle' },
  { label: 'بزرگ', value: 'large' },
]

const fontSizeOptions: SegmentedOptions = FONT_SIZE_OPTIONS.map((value) => ({
  label: `${value}`,
  value,
}))

const borderRadiusOptions: SegmentedOptions = BORDER_RADIUS_OPTIONS.map((value) => ({
  label: value,
  value,
}))

const appearanceValue = computed<SegmentedValue>({
  get: () => appearance.value,
  set: (value) => {
    if (value === 'light' || value === 'dark') {
      store.setAppearance(value satisfies AppAppearance)
    }
  },
})

const compactValue = computed<SegmentedValue>({
  get: () => compact.value,
  set: (value) => {
    if (value === 'compact' || value === 'default') {
      store.setCompact(value satisfies AppCompact)
    }
  },
})

const sizeValue = computed<SegmentedValue>({
  get: () => componentSize.value,
  set: (value) => {
    if (value === 'small' || value === 'middle' || value === 'large') {
      store.setComponentSize(value satisfies AppComponentSize)
    }
  },
})

const fontSizeValue = computed<SegmentedValue>({
  get: () => fontSize.value,
  set: (value) => {
    if (value === 10 || value === 12 || value === 14 || value === 16 || value === 18) {
      store.setFontSize(value satisfies AppFontSize)
    }
  },
})

const borderRadiusValue = computed<SegmentedValue>({
  get: () => borderRadius.value,
  set: (value) => {
    if (value === 0 || value === 3 || value === 6 || value === 9 || value === 12) {
      store.setBorderRadius(value satisfies AppBorderRadius)
    }
  },
})

function close(): void {
  emit('update:open', false)
}

function onOpenChange(next: boolean): void {
  emit('update:open', next)
}

function colorLabel(name: string): string {
  return `رنگ ${name}`
}

function resetSettings(): void {
  store.resetSettings()
}
</script>

<template>
  <Drawer
    :open="props.open"
    title="تنظیمات"
    placement="left"
    :width="360"
    @update:open="onOpenChange"
    @close="close"
  >
    <template #extra>
      <Tooltip title="بازنشانی تنظیمات">
        <Button type="text" danger aria-label="بازنشانی تنظیمات" @click="resetSettings">
          <template #icon>
            <UndoOutlined />
          </template>
        </Button>
      </Tooltip>
    </template>
    <Flex vertical :gap="24">
      <div>
        <TypographyText strong class="mb-2 block">رنگ اصلی</TypographyText>
        <Flex wrap="wrap" :gap="8">
          <button
            v-for="preset in primaryColorPresets"
            :key="preset.name"
            type="button"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :aria-label="colorLabel(preset.name)"
            :aria-pressed="palettePrimary(preset.palette) === colorPrimary"
            @click="store.setColorPrimary(palettePrimary(preset.palette))"
          >
            <span
              class="flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-(--ant-color-bg-container)"
              :class="
                palettePrimary(preset.palette) === colorPrimary
                  ? 'ring-primary'
                  : 'ring-transparent'
              "
              :style="{ backgroundColor: palettePrimary(preset.palette) }"
            >
              <CheckOutlined
                v-if="palettePrimary(preset.palette) === colorPrimary"
                class="text-xs text-white"
              />
            </span>
          </button>
        </Flex>
      </div>

      <Divider class="m-0!" />

      <div>
        <TypographyText strong class="mb-2 block">ظاهر</TypographyText>
        <Segmented v-model:value="appearanceValue" block :options="appearanceOptions" />
      </div>

      <Divider class="m-0!" />

      <div>
        <TypographyText strong class="mb-2 block">حالت فشرده</TypographyText>
        <Segmented v-model:value="compactValue" block :options="compactOptions" />
      </div>

      <Divider class="m-0!" />

      <div>
        <TypographyText strong class="mb-2 block">اندازه اجزا</TypographyText>
        <Segmented v-model:value="sizeValue" block :options="sizeOptions" />
      </div>

      <Divider class="m-0!" />

      <div>
        <TypographyText strong class="mb-2 block">اندازه فونت</TypographyText>
        <Segmented v-model:value="fontSizeValue" block :options="fontSizeOptions" />
      </div>

      <Divider class="m-0!" />

      <div>
        <TypographyText strong class="mb-2 block">گردی گوشه</TypographyText>
        <Segmented v-model:value="borderRadiusValue" block :options="borderRadiusOptions" />
      </div>
    </Flex>
  </Drawer>
</template>
