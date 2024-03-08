<script setup lang="ts">
import { appName } from '~/constants'

useHead({
  title: appName,
})
</script>

<template>
  <Toast />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
@import 'primevue/resources/themes/aura-light-green/theme.css';

@font-face {
  font-family: 'harmony-sans';
  src: url('/fonts/HarmonyOS_Sans_SC_Regular.woff2') format('woff2');
  font-weight: 400;
  /* Regular */
}

@font-face {
  font-family: 'harmony-sans';
  src: url('/fonts/HarmonyOS_Sans_SC_Bold.woff2') format('woff2');
  font-weight: 700;
  /* Bold */
}

html,
body,
#__nuxt {
  min-height: 100vh;
  margin: 0;
  padding: 0;
  font-family: 'harmony-sans';
}

html.dark {
  background: #222;
  color: white;
}
</style>
