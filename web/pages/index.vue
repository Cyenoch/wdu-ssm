<script setup lang="ts">
</script>

<template>
  <div class="h-100vh flex flex-wrap items-center justify-center gap-3">
    <NuxtLink :to="{ name: 'sign-in' }">
      <Button>
        Sign in
      </Button>
    </NuxtLink>
  </div>
</template>
