import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { abilitiesPlugin } from '@casl/vue'
import 'ant-design-vue/dist/reset.css'
import './assets/main.css'
import { ability } from './ability'
import App from './App.vue'
import { setUnauthorizedHandler } from './api/client'
import router from './router'
import { useAuthStore } from './stores/auth.store'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
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
