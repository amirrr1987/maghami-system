import { createHead } from '@unhead/vue/client'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { abilitiesPlugin } from '@casl/vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import 'ant-design-vue/dist/reset.css'
import './assets/main.css'
import { ability } from './ability'
import App from './App.vue'
import { setUnauthorizedHandler } from './api/client'
import { initSession } from '@/modules/auth/composables/useSession'
import { queryClient } from './query/client'
import router from './router'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const app = createApp(App)
const pinia = createPinia()
const head = createHead()

initSession()

app.use(pinia)
app.use(head)
app.use(VueQueryPlugin, { queryClient })
app.use(abilitiesPlugin, ability, {
  useGlobalProperties: true,
})
app.use(router)

setUnauthorizedHandler(() => {
  const auth = useAuthStore(pinia)
  auth.clearSession()
  void router.replace({ name: 'login' })
})

app.mount('#app')
