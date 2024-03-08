<script setup lang="ts">
const router = useRouter()
const route = useRoute('school-id-sign-in')
const school = computed(() => `school${route.params.id}` as 'school1' | 'school2')

if (!['school1', 'school2'].includes(school.value))
  router.back()
</script>

<template>
  <div h-100vh w-full col items-center justify-center>
    <SignInForm type="School" max-w-150 :school="school" />
  </div>
</template>

<style scoped>

</style>
