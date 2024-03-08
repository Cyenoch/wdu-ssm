<script setup lang="ts">
const options = ['BureauAdmin', 'Student']
const signUpType = ref('BureauAdmin')
</script>

<template>
  <div h-100vh w-full col items-center justify-center>
    <Card max-w-150>
      <template #title>
        登录
      </template>
      <template #subtitle>
        登录学籍管理系统
      </template>

      <template #content>
        <div col gap-6>
          <SelectButton v-model="signUpType" mt-2 :options="options" aria-labelledby="basic" row />

          <InputGroup>
            <InputGroupAddon>
              <i i-carbon-user />
            </InputGroupAddon>
            <InputText placeholder="用户名" />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <i i-carbon-password />
            </InputGroupAddon>
            <Password placeholder="密码" toggle-mask />
          </InputGroup>
        </div>
      </template>
      <template #footer>
        <div class="mt-1 flex gap-3">
          <Button label="取消" severity="secondary" outlined class="w-full" />
          <Button label="登录" class="w-full" />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>

</style>
