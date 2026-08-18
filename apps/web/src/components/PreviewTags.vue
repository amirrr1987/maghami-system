<script setup lang="ts">
import { Button, Flex, Modal, Tag, TypographyText } from 'ant-design-vue'
import { computed, ref } from 'vue'

export interface PreviewTagItem {
  key: string
  label: string
}

const props = withDefaults(
  defineProps<{
    items: readonly PreviewTagItem[]
    title?: string
    max?: number
  }>(),
  {
    title: 'همه موارد',
    max: 3,
  },
)

const open = ref(false)

const preview = computed(() => props.items.slice(0, props.max))
const restCount = computed(() => Math.max(0, props.items.length - props.max))
</script>

<template>
  <TypographyText v-if="items.length === 0" type="secondary">—</TypographyText>
  <Flex v-else wrap="wrap" :gap="4" align="center" class="min-w-0">
    <Tag v-for="item in preview" :key="item.key">{{ item.label }}</Tag>
    <Button v-if="restCount > 0" type="dashed" size="small" @click="open = true">
      +{{ restCount }} مورد
    </Button>
  </Flex>
  <Modal
    v-model:open="open"
    :title="title"
    :footer="null"
    destroy-on-close
  >
    <Flex wrap="wrap" :gap="8">
      <Tag v-for="item in items" :key="item.key">{{ item.label }}</Tag>
    </Flex>
  </Modal>
</template>
