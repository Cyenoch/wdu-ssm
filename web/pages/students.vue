<script setup lang="ts">
const { data } = useFetch('/api/contract/sm/students')
</script>

<template>
  <div p-8>
    <h1 m-0>
      管理学生档案
    </h1>

    <div>
      {{ data }}
    </div>
  </div>
</template>1

<style scoped>

</style>
