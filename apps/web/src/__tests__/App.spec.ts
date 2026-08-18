import { describe, expect, it } from 'vitest'
import { createHead } from '@unhead/vue/client'
import type { VueHeadClient } from '@unhead/vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
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
    const head: VueHeadClient = createHead({ document })

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), head, [VueQueryPlugin, { queryClient }], router],
      },
    })

    expect(wrapper.exists()).toBe(true)
    await nextTick()
    head.render()
    expect(document.title).toBe('خانه | Maghami system')
  })
})
