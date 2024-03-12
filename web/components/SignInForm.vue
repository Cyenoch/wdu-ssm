<script setup lang="ts">
import type { Database } from '~/types/schema.gen'

const props = defineProps<{
  type: 'Bureau' | 'School'
  school?: 'school1' | 'school2'
}>()
const router = useRouter()
const toast = useToast()
const supa = useSupabaseClient<Database>()
const user = useSupabaseUser()

watch(user, (user) => {
  console.info('???', user)
})

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
    type: props.type,
    school: props.school,
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
    if ('refresh_token' in data) {
      // await supa.auth.setSession(data.session!)
      await supa.auth.setSession(data)
      console.info('??')
    }

    if ('id' in data || 'access_token' in data)
    // if (false)
      router.replace(router.currentRoute.value.query.redirectTo?.toString() ?? { name: 'me' })
  }
})

async function signIn() {
  await execute()
}
</script>

<template>
  <Card>
    <template #title>
      登录
    </template>
    <template #subtitle>
      {{ props.type === 'Bureau' ? '登录教育局' : '登录学校' }}
    </template>

    <template #content>
      <div col gap-6>
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
        <Button label="登录" :loading="status === 'pending'" class="w-full" @click="signIn" />
      </div>
    </template>
  </Card>
</template>

<style scoped></style>
