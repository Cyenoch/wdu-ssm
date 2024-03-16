<script setup lang="ts">
import type { Database } from '~/types/schema.gen'

const peers = await $fetch('/api/peers')
const msp = ref(peers[0].msp)

const router = useRouter()
const toast = useToast()
const supa = useSupabaseClient<Database>()

const query = ref({
  username: '',
  password: '',
})

const {
  status,
  execute,
  error,
  data,
} = useFetch('/api/sign-in', {
  query: computed(() => ({
    ...query.value,
    msp: msp.value,
  })),
  watch: false,
  immediate: false,
})

watch(error, (error) => {
  if (error)
    toast.add({ severity: 'error', summary: '登录失败', detail: error.data.message, life: 5000 })
})

watch(data, async (data) => {
  if (data) {
    if ('refresh_token' in data)
      await supa.auth.setSession(data)
    if ('id' in data || 'access_token' in data)
      // if (false)
      router.replace(router.currentRoute.value.query.redirectTo?.toString() ?? { name: 'me' })
  }
})
</script>

<template>
  <div h-100vh w-full col items-center justify-center>
    <Card v-focustrap max-w-150>
      <template #title>
        登录
      </template>
      <template #subtitle>
        登录学籍管理系统
      </template>

      <template #content>
        <div col gap-6>
          <SelectButton
            v-model="msp" mt-2 :options="peers" option-value="msp" option-label="name" data-key="msp"
            aria-labelledby="custom" row
          >
            <template #option="slotProps">
              <span z-10>{{ slotProps.option.name }}</span>
            </template>
          </SelectButton>

          <InputGroup>
            <InputGroupAddon>
              <i i-carbon-user />
            </InputGroupAddon>
            <InputText v-model="query.username" placeholder="用户名" />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <i i-carbon-password />
            </InputGroupAddon>
            <Password v-model="query.password" placeholder="密码" toggle-mask :feedback="false" />
          </InputGroup>
        </div>
      </template>
      <template #footer>
        <div class="mt-1 flex gap-3">
          <Button label="取消" severity="secondary" outlined class="w-full" @click="$router.back()" />
          <Button label="登录" :loading="status === 'pending'" class="w-full" @click="execute()" />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped></style>
