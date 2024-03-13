<script setup lang="ts">
const { data: students } = useFetch('/api/contract/sm/students', {
  server: false,
})
</script>

<template>
  <div p-8>
    <h1 m-0>
      管理学生档案
    </h1>

    <div mt-4>
      <div mb-4 text-end>
        <Button color="primary" size="small">
          新增学生
        </Button>
      </div>

      <DataTable :value="students">
        <Column header="#">
          <template #body="{ index }">
            {{ index + 1 }}
          </template>
        </Column>
        <Column field="ID" header="id" />
        <Column field="Name" header="Name" />
        <Column field="School" header="School" />
        <Column field="Grade" header="Grade" />
        <Column field="Major" header="Major" />
      </DataTable>
    </div>
  </div>
</template>1

<style scoped></style>
