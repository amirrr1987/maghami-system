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
  }>(),
  {
    title: 'همه موارد',
  },
)

const open = ref(false)
const first = computed(() => props.items[0])
</script>

<template>
  <TypographyText v-if="items.length === 0" type="secondary">—</TypographyText>
  <Flex v-else align="center" :gap="8" class="min-w-0 max-w-full">
    <Tag v-if="first" class="m-0! max-w-44 truncate">{{ first.label }}</Tag>
    <Button v-if="items.length > 1" type="dashed" size="small" class="shrink-0" @click="open = true">
      {{ items.length }} مورد
    </Button>
  </Flex>
  <Modal v-model:open="open" :title="title" :footer="null" destroy-on-close>
    <Flex wrap="wrap" :gap="8">
      <Tag v-for="item in items" :key="item.key">{{ item.label }}</Tag>
    </Flex>
  </Modal>
</template>
