<script setup lang="ts">
const router = useRouter()
const user = useSupabaseUser()
const supa = useSupabaseClient()
watch(user, (user) => {
  if (!user)
    router.replace({ name: 'index' })
})
</script>

<template>
  <div col gap-4 p-8>
    <div w-full>
      <h2>当前用户信息</h2>
      <code block overflow-scroll whitespace-pre-wrap p-2 shadow-lg ring>{{ JSON.stringify(user, null, 2) }}</code>
    </div>

    <div>
      <h2>操作</h2>
      <div row gap-4>
        <Button @click="supa.auth.signOut()">
          注销
        </Button>

        <NuxtLink to="/students">
          <Button v-identity-guard="{ affiliation: 'unit.admin' }">
            管理档案
          </Button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
