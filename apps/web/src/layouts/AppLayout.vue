<script setup lang="ts">
import {
  AppstoreOutlined,
  BarsOutlined,
  BgColorsOutlined,
  ClusterOutlined,
  FolderOpenOutlined,
  LogoutOutlined,
  NumberOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import {
  Avatar,
  Button,
  Dropdown,
  Flex,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutSider,
  Menu,
  Space,
  TypographyText,
  TypographyTitle,
  Divider
} from 'ant-design-vue'
import type { MenuProps } from 'ant-design-vue'
import { computed, h, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppAbility } from '@/ability'
import SettingDrawer from '@/components/SettingDrawer.vue'
import UserProfileModal from '@/components/UserProfileModal.vue'
import { useAuthStore } from '@/stores/auth.store'
import {
  PermissionAction,
  PermissionResource,
} from '@maghami-system/schemas'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { can } = useAppAbility()

const collapsed = ref(false)
const settingOpen = ref(false)
const profileOpen = ref(false)

const settingsAriaLabel = 'باز کردن تنظیمات'

const selectedKeys = computed(() => [
  route.name ? String(route.name) : 'users',
])

const USER_MANAGEMENT_KEY = 'user-management'
const PRODUCT_CODING_KEY = 'product-coding'
const userManagementChildKeys = new Set(['users', 'roles', 'permissions'])
const productCodingChildKeys = new Set([
  'products',
  'product-categories',
  'product-brands',
  'product-units',
  'product-attributes',
  'product-code-patterns',
])

const openKeys = ref<string[]>([])

watch(
  () => route.name,
  (name) => {
    if (!name) return
    const key = String(name)
    const next = [...openKeys.value]
    if (
      userManagementChildKeys.has(key) &&
      !next.includes(USER_MANAGEMENT_KEY)
    ) {
      next.push(USER_MANAGEMENT_KEY)
    }
    if (
      productCodingChildKeys.has(key) &&
      !next.includes(PRODUCT_CODING_KEY)
    ) {
      next.push(PRODUCT_CODING_KEY)
    }
    openKeys.value = next
  },
  { immediate: true },
)

const menuItems = computed<MenuProps['items']>(() => {
  const userManagement: NonNullable<MenuProps['items']> = []
  if (can(PermissionAction.Read, PermissionResource.Users)) {
    userManagement.push({
      key: 'users',
      icon: () => h(UserOutlined),
      label: 'کاربران',
    })
  }
  if (can(PermissionAction.Read, PermissionResource.Roles)) {
    userManagement.push({
      key: 'roles',
      icon: () => h(TeamOutlined),
      label: 'نقش‌ها',
    })
  }
  if (can(PermissionAction.Read, PermissionResource.Permissions)) {
    userManagement.push({
      key: 'permissions',
      icon: () => h(SafetyCertificateOutlined),
      label: 'مجوزها',
    })
  }

  const productCoding: NonNullable<MenuProps['items']> = []
  if (can(PermissionAction.Read, PermissionResource.Products)) {
    productCoding.push({
      key: 'products',
      icon: () => h(ShoppingOutlined),
      label: 'محصولات',
    })
  }
  if (can(PermissionAction.Read, PermissionResource.ProductCategories)) {
    productCoding.push({
      key: 'product-categories',
      icon: () => h(ClusterOutlined),
      label: 'دسته‌بندی',
    })
  }
  if (can(PermissionAction.Read, PermissionResource.ProductBrands)) {
    productCoding.push({
      key: 'product-brands',
      icon: () => h(BgColorsOutlined),
      label: 'برند',
    })
  }
  if (can(PermissionAction.Read, PermissionResource.ProductUnits)) {
    productCoding.push({
      key: 'product-units',
      icon: () => h(NumberOutlined),
      label: 'واحد',
    })
  }
  if (can(PermissionAction.Read, PermissionResource.ProductAttributes)) {
    productCoding.push({
      key: 'product-attributes',
      icon: () => h(BarsOutlined),
      label: 'ویژگی',
    })
  }
  if (can(PermissionAction.Read, PermissionResource.ProductCodePatterns)) {
    productCoding.push({
      key: 'product-code-patterns',
      icon: () => h(AppstoreOutlined),
      label: 'الگوی کدینگ',
    })
  }

  const items: NonNullable<MenuProps['items']> = []
  if (userManagement.length > 0) {
    items.push({
      key: USER_MANAGEMENT_KEY,
      icon: () => h(TeamOutlined),
      label: 'مدیریت کاربران',
      children: userManagement,
    })
  }
  if (productCoding.length > 0) {
    if (items.length > 0) {
      items.push({ type: 'divider' })
    }
    items.push({
      key: PRODUCT_CODING_KEY,
      icon: () => h(ShoppingOutlined),
      label: 'سیستم کدینگ کالا',
      children: productCoding,
    })
  }
  if (can(PermissionAction.Read, PermissionResource.Files)) {
    if (items.length > 0) {
      items.push({ type: 'divider' })
    }
    items.push({
      key: 'files',
      icon: () => h(FolderOpenOutlined),
      label: 'مدیریت فایل‌ها',
    })
  }
  return items
})

const userMenuItems = computed<MenuProps['items']>(() => [
  {
    key: 'profile',
    icon: () => h(UserOutlined),
    label: 'پروفایل',
  },
  {
    key: 'logout',
    icon: () => h(LogoutOutlined),
    label: 'خروج',
    danger: true,
  },
])

const onMenuClick: MenuProps['onClick'] = (info) => {
  const key = String(info.key)
  if (key === USER_MANAGEMENT_KEY || key === PRODUCT_CODING_KEY) return
  void router.push({ name: key })
}

const onUserMenuClick: MenuProps['onClick'] = (info) => {
  if (info.key === 'profile') {
    profileOpen.value = true
    return
  }
  if (info.key === 'logout') {
    void onLogout()
  }
}

async function onLogout(): Promise<void> {
  await auth.logout()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <Layout class="h-screen">
    <LayoutHeader>
      <Flex
        align="center"
        justify="space-between"
        class="h-full w-full"
      >
        <RouterLink to="/">
          <TypographyTitle
            :level="5"
            class="m-0! truncate text-primary!"
          >
            Monitoring
          </TypographyTitle>
        </RouterLink>
        <Space :size="8">

          <Dropdown :trigger="['click']">
            <Space class="cursor-pointer">
              <Avatar :size="32">
                <template #icon>
                  <UserOutlined />
                </template>
              </Avatar>
              <TypographyText>{{ auth.user?.name }}</TypographyText>
            </Space>
            <template #overlay>
              <Menu
                :items="userMenuItems"
                @click="onUserMenuClick"
              />
            </template>
          </Dropdown>

          <Divider type="vertical" />
          <Button
            type="text"
            shape="circle"
            :aria-label="settingsAriaLabel"
            @click="settingOpen = true"
          >
            <template #icon>
              <SettingOutlined />
            </template>
          </Button>
        </Space>
      </Flex>
    </LayoutHeader>

    <Layout>
      <LayoutSider
        v-model:collapsed="collapsed"
        collapsible
        breakpoint="lg"
        :width="270"
      >
        <Menu
          mode="inline"
          v-model:openKeys="openKeys"
          :selected-keys="selectedKeys"
          :items="menuItems"
          @click="onMenuClick"
        />
      </LayoutSider>
      <LayoutContent class="p-4 overflow-y-auto">
        <RouterView />
      </LayoutContent>
    </Layout>
    <SettingDrawer v-model:open="settingOpen" />
    <UserProfileModal v-model:open="profileOpen" />
  </Layout>
</template>
