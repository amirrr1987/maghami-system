import { describe, expect, it } from 'vitest'
import { createPinia } from 'pinia'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../App.vue'

describe('App', () => {
  it('mounts with ConfigProvider shell', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: { template: '<div>home</div>' },
          meta: { public: true },
        },
      ],
    })
    await router.push('/')
    await router.isReady()

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), [VueQueryPlugin, { queryClient }], router],
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})
