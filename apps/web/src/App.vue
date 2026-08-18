<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import { useHead } from '@unhead/vue'
import type { UseHeadInput } from '@unhead/vue'
import { RouterView, useRoute } from 'vue-router'
import { useConfigProviderStore } from './stores/configProvider.store'

const SITE_TITLE = 'Maghami system'

const configProviderStore = useConfigProviderStore()
const route = useRoute()

const head: UseHeadInput = {
  title: () => {
    const page = route.meta.title
    return page ? `${page} | ${SITE_TITLE}` : SITE_TITLE
  },
  htmlAttrs: {
    lang: 'fa',
    dir: 'rtl',
  },
}
useHead(head)
</script>

<template>
  <ConfigProvider
    :locale="configProviderStore.locale"
    :direction="configProviderStore.direction"
    :component-size="configProviderStore.componentSize"
    :theme="configProviderStore.theme"
  >
    <RouterView />
  </ConfigProvider>
</template>
