<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import { RouterView } from 'vue-router'
import { useConfigProviderStore } from './stores/configProvider.store'

import { useHead } from '@unhead/vue'

const configProviderStore = useConfigProviderStore()

useHead({
  title: 'Web',
})

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
