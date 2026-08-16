<script setup lang="ts">
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue'
import {
  Alert,
  Button,
  Card,
  Flex,
  Form,
  FormItem,
  Input,
  InputPassword,
  Layout,
  LayoutContent,
  TypographyText,
  TypographyTitle,
} from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue/es/form'
import type { LoginDto } from '@vue-nestjs-admin-template/schemas'
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/api/types'
import { resolvePostLoginLocation } from '@/router/access'
import { useAuthStore } from '@/stores/auth.store'
import { loginFormRules } from '@/validation/login.form-rules'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const model = reactive<LoginDto>({
  email: '',
  password: '',
})

const NO_ACCESS_MESSAGE =
  'این حساب هیچ دسترسی‌ای ندارد. با ادمین وارد شوید و به کاربر یک نقش دارای مجوز بدهید.'

const UNMAPPED_ACCESS_MESSAGE =
  'مجوز دارید ولی با هیچ صفحه‌ای منطبق نیست. resource باید یکی از enumهای کاتالوگ باشد (مثل products / users).'

function applyReasonFromQuery(): void {
  if (route.query.reason === 'no_access') {
    errorMessage.value = NO_ACCESS_MESSAGE
  }
}

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof TypeError) && !(error instanceof DOMException)) {
    return false
  }
  const message = error.message.toLowerCase()
  return (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('failed') ||
    error.name === 'AbortError' ||
    error.name === 'TimeoutError'
  )
}

function messageFromError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'ایمیل یا رمز عبور نادرست است'
    if (error.status === 0 || error.status >= 500) {
      return 'ارتباط با سرور برقرار نشد'
    }
    return error.message || 'ورود ناموفق بود'
  }
  if (isNetworkError(error)) {
    return 'ارتباط با سرور برقرار نشد (API را چک کنید)'
  }
  if (error instanceof Error && error.message === 'UNMAPPED_ACCESS') {
    return UNMAPPED_ACCESS_MESSAGE
  }
  if (error instanceof Error && error.message === 'NO_ACCESS') {
    return NO_ACCESS_MESSAGE
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'ورود ناموفق بود'
}

async function onSubmit(): Promise<void> {
  errorMessage.value = null
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    const result = await auth.login({
      email: model.email.trim(),
      password: model.password,
    })

    if (result.abilities.length === 0) {
      await auth.logout()
      errorMessage.value = NO_ACCESS_MESSAGE
      return
    }

    try {
      const target = resolvePostLoginLocation(router, route)
      await router.replace(target)
    } catch (navError) {
      await auth.logout()
      if (navError instanceof Error && navError.message === 'NO_ACCESS') {
        errorMessage.value = UNMAPPED_ACCESS_MESSAGE
        return
      }
      throw navError
    }
  } catch (error) {
    errorMessage.value = messageFromError(error)
  } finally {
    loading.value = false
  }
}

onMounted(applyReasonFromQuery)
watch(() => route.query.reason, applyReasonFromQuery)
</script>

<template>
  <Layout class="min-h-screen">
    <LayoutContent>
      <Flex align="center" justify="center" class="min-h-screen p-6">
        <Card class="w-full max-w-md">
          <Flex vertical align="center" :gap="4" class="mb-6">
            <TypographyTitle :level="3" class="m-0!">
              Monitoring
            </TypographyTitle>
            <TypographyText type="secondary">
              ورود به پنل مدیریت
            </TypographyText>
          </Flex>

          <Alert
            v-if="errorMessage"
            class="mb-4"
            type="error"
            show-icon
            :message="errorMessage"
          />

          <Form
            ref="formRef"
            layout="vertical"
            :model="model"
            :rules="loginFormRules"
            @finish="onSubmit"
          >
            <FormItem label="ایمیل" name="email">
              <Input
                v-model:value="model.email"
                size="large"
                autocomplete="username"
                placeholder="super-admin@localhost.ir"
                allow-clear
              >
                <template #prefix>
                  <UserOutlined />
                </template>
              </Input>
            </FormItem>
            <FormItem label="رمز عبور" name="password">
              <InputPassword
                v-model:value="model.password"
                size="large"
                autocomplete="current-password"
                placeholder="••••••••"
              >
                <template #prefix>
                  <LockOutlined />
                </template>
              </InputPassword>
            </FormItem>
            <FormItem class="mb-0!">
              <Button
                type="primary"
                html-type="submit"
                size="large"
                block
                :loading="loading"
              >
                ورود
              </Button>
            </FormItem>
          </Form>
        </Card>
      </Flex>
    </LayoutContent>
  </Layout>
</template>
