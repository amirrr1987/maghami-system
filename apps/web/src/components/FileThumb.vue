<script setup lang="ts">
import { FileImageOutlined } from '@ant-design/icons-vue'
import { Avatar } from 'ant-design-vue'
import { toRef } from 'vue'
import { useAuthFileUrl } from '@/composables/useAuthFileUrl'

const props = withDefaults(
  defineProps<{
    fileId: string | null
    size?: number
    alt?: string
  }>(),
  {
    size: 96,
    alt: '',
  },
)

const { url } = useAuthFileUrl(toRef(props, 'fileId'))
</script>

<template>
  <Avatar shape="square" :size="size" :src="url ?? undefined" :alt="alt">
    <template #icon>
      <FileImageOutlined />
    </template>
  </Avatar>
</template>
