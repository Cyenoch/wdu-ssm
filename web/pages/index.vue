<script setup lang="ts">
const schools = ['1', '2']
</script>

<template>
  <div class="h-100vh flex flex-wrap items-center justify-center gap-3">
    <NuxtLink v-for="school in schools" :key="school" :to="{ name: 'school-id-sign-in', params: { id: school } }">
      <Button>
        进入学校{{ school }}
      </Button>
    </NuxtLink>

    <NuxtLink :to="{ name: 'bureau-sign-in' }">
      <Button>
        进入教育局
      </Button>
    </NuxtLink>
  </div>
</template>
