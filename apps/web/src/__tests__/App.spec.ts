import { describe, expect, it } from 'vitest'
import { createHead } from '@unhead/vue/client'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
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
          meta: { public: true, title: 'خانه' },
        },
      ],
    })
    await router.push('/')
    await router.isReady()

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const head = createHead()

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), head, [VueQueryPlugin, { queryClient }], router],
      },
    })

    expect(wrapper.exists()).toBe(true)
    await flushPromises()
    expect(document.title).toBe('خانه | Maghami system')
  })
})
