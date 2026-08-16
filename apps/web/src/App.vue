<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import { RouterView } from 'vue-router'
import { useConfigProviderStore } from './stores/configProvider.store'

const configProviderStore = useConfigProviderStore()
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
