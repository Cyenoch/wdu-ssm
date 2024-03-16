<script setup lang="ts">
import type { TreeNode } from 'primevue/treenode'
import { formatDistanceToNow } from 'date-fns'
import CreateStudent from '~/components/CreateStudent.vue'
import UpdateStudent from '~/components/UpdateStudent.vue'
import type { Student } from '~/types/cc-sm'

const query = ref({ size: 20, bookmark: '' })

const { data, refresh } = useFetch('/api/contract/sm/students', {
  query: computed(() => query.value),
})

const students = computed(() => data.value && 'items' in data.value ? data.value.items : [])
const bookmark = computed(() => data.value && 'bookmark' in data.value ? data.value.bookmark : '')

const creationVisible = ref(false)
const updateVisible = ref(false)
const needToUpdate = ref<Student>()
</script>

<template>
  <!-- eslint-disable vue/no-template-shadow -->
  <div limited-w>
    <h1 m-0>
      管理学生档案
    </h1>

    <div mt-4>
      <div v-focustrap mb-4>
        <Button color="primary" size="small" @click="$router.back()">
          返回
        </Button>
        <Button color="primary" float-right size="small" @click="creationVisible = !creationVisible">
          新增学生
        </Button>

        <CreateStudent v-model:visible="creationVisible" @succeed="refresh" />
        <UpdateStudent v-if="needToUpdate" v-bind="needToUpdate" v-model:visible="updateVisible" @succeed="refresh" />
      </div>

      <DataTable overflow-hidden b-1 b-gray-200 rounded-lg b-solid shadow-lg :value="students">
        <Column header="#">
          <template #body="{ index }">
            {{ index + 1 }}
          </template>
        </Column>
        <Column field="id" header="id" />
        <Column field="name" header="Name" />
        <Column field="school" header="School" />
        <Column field="admissionYear" header="AdmissionYear" />
        <Column field="major" header="Major" />
        <Column field="graduated" header="Graduated">
          <template #body="{ data }">
            <Tag :severity="data.graduated ? 'success' : 'info'" :value="data.graduated ? '已毕业' : '在读'" />
          </template>
        </Column>
        <Column header="CreationDate">
          <template #body="{ data }">
            {{ formatDistanceToNow(data.creationDate) }}
          </template>
        </Column>
        <Column header="Action">
          <template #body="{ data }">
            <Button
              size="small" @click="() => {
                needToUpdate = data
                updateVisible = true
              }"
            >
              UPDATE
            </Button>
          </template>
        </Column>
      </DataTable>

      <Button m-auto mt-8 block @click="query.bookmark = bookmark">
        Next Page
      </Button>
    </div>
  </div>
</template>1

<style scoped></style>
