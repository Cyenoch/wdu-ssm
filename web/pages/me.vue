<script setup lang="ts">
const router = useRouter()
const user = useSupabaseUser()
const supa = useSupabaseClient()
watch(user, (user) => {
  if (!user)
    router.replace({ name: 'index' })
})

const affiliation = computed(() => user.value?.app_metadata.identity.affiliation.split('.') ?? [])
const attrs = computed(() => user.value?.app_metadata.identity.attrs ?? [])
</script>

<template>
  <div limited-w col gap-4>
    <h1 m-0>
      Hello~
    </h1>

    <Panel header="当前用户信息">
      <div grid class="grid-cols-[repeat(auto-fill,minmax(250px,1fr))]" gap-x-4>
        <Fieldset legend="ID" col-span-2>
          {{ user?.id }}
        </Fieldset>
        <Fieldset legend="Affiliation">
          <div row gap-2>
            <Chip v-for="tag, idx in affiliation" :key="idx" :label="tag" />
          </div>
        </Fieldset>

        <Fieldset legend="MSP">
          {{ user?.app_metadata.msp }}
        </Fieldset>

        <Fieldset legend="User Email">
          {{ user?.email }}
        </Fieldset>

        <Fieldset v-for="attr in attrs" :key="attr.name" :legend="attr.name">
          {{ attr.value }}
        </Fieldset>
      </div>

      <!-- <code block overflow-scroll whitespace-pre-wrap p-2 shadow-lg ring>{{ JSON.stringify(user, null, 2) }}</code> -->
    </Panel>

    <Panel header="操作">
      <div row gap-4>
        <Button @click="supa.auth.signOut()">
          注销
        </Button>

        <NuxtLink to="/students">
          <Button v-identity-guard="{ affiliation: '[school1|school2|bureau].manager' }">
            管理档案
          </Button>
        </NuxtLink>
      </div>
    </Panel>
  </div>
</template>

<style scoped></style>
