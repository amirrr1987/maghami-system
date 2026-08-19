<script setup lang="ts">
import { Form, FormItem, Input, InputPassword, Modal } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue/es/form'
import type { UpdateProfileDto } from '@maghami-system/schemas'
import { computed, reactive, ref, watch } from 'vue'
import ImageUploader from '@/modules/files/components/ImageUploader.vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { profileFormRules, type ProfileFormModel } from '@/modules/auth/validation/profile.form-rules'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const auth = useAuthStore()
const formRef = ref<FormInstance>()

const model = reactive<ProfileFormModel>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const avatarFileIds = ref<string[]>([])
const avatarCoverFileId = ref<string | null>(null)

const rules = computed(() => profileFormRules(model))

function fillFromSession(): void {
  model.name = auth.user?.name ?? ''
  model.email = auth.user?.email ?? ''
  model.password = ''
  model.confirmPassword = ''
  const avatarId = auth.user?.avatarFileId ?? null
  avatarFileIds.value = avatarId ? [avatarId] : []
  avatarCoverFileId.value = avatarId
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    fillFromSession()
    void formRef.value?.clearValidate()
  },
)

function close(): void {
  emit('update:open', false)
}

function toDto(): UpdateProfileDto {
  const dto: UpdateProfileDto = {
    name: model.name,
    email: model.email,
    avatarFileId: avatarFileIds.value[0] ?? null,
  }
  if (model.password) {
    dto.password = model.password
  }
  return dto
}

async function onSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  const ok = await auth.updateProfile(toDto())
  if (ok) {
    close()
  }
}
</script>

<template>
  <Modal
    :open="props.open"
    title="پروفایل"
    :confirm-loading="auth.savingProfile"
    destroy-on-close
    ok-text="ذخیره"
    cancel-text="انصراف"
    @update:open="emit('update:open', $event)"
    @ok="onSubmit"
    @cancel="close"
  >
    <Form ref="formRef" layout="vertical" :model="model" :rules="rules">
      <FormItem label="آواتار">
        <ImageUploader
          v-model:file-ids="avatarFileIds"
          v-model:cover-file-id="avatarCoverFileId"
          :multiple="false"
          :max-count="1"
        />
      </FormItem>
      <FormItem label="نام" name="name">
        <Input v-model:value="model.name" allow-clear />
      </FormItem>
      <FormItem label="ایمیل" name="email">
        <Input v-model:value="model.email" autocomplete="off" allow-clear />
      </FormItem>
      <FormItem label="رمز عبور جدید (اختیاری)" name="password">
        <InputPassword v-model:value="model.password" autocomplete="new-password" />
      </FormItem>
      <FormItem label="تکرار رمز عبور" name="confirmPassword">
        <InputPassword v-model:value="model.confirmPassword" autocomplete="new-password" />
      </FormItem>
    </Form>
  </Modal>
</template>
