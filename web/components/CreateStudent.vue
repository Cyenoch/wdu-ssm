<script setup lang="ts">
import InputGroup from 'primevue/inputgroup'
import type { TreeNode } from 'primevue/treenode'
import type { AvailableMSP } from '~/types'

const emit = defineEmits<{
  succeed: []
}>()
const visible = defineModel<boolean>('visible', { default: false })
const schools = ref([{
  name: 'School1',
  value: 'School1MSP',
}, {
  name: 'School2',
  value: 'School2MSP',
}])
const toast = useToast()
const selectedMajor = ref<Record<string, boolean>>({})
const form = ref({
  id: '',
  name: '',
  major: '',
  school: 'School1MSP',
})

const {
  execute,
  data,
  error,
  status,
} = useFetch('/api/contract/sm/student', {
  method: 'POST',
  body: computed(() => ({
    ...form.value,
    major: Object.keys(selectedMajor.value)[0],
  })),
  immediate: false,
  watch: false,
})

watch(error, (error) => {
  if (error)
    toast.add({ severity: 'error', summary: '登录失败', detail: error.data.message, life: 5000 })
})
watch(data, (data) => {
  console.info('data', data)
  visible.value = false
  emit('succeed')
})

const majors = await $fetch('/api/majors').then((majors) => {
  const transform = (_majors: typeof majors): TreeNode[] => {
    return _majors.map(major => ({
      key: major.name,
      label: major.name,
      leaf: !major.nodes,
      selectable: !major.nodes,
      children: transform((major.nodes ?? []) as any),
    }))
  }
  return transform(majors)
})
</script>

<template>
  <Dialog v-model:visible="visible" modal header="新增学生">
    <div col gap-4>
      <InputGroup>
        <InputGroupAddon>
          <i i-carbon-id />
        </InputGroupAddon>
        <InputText v-model="form.id" placeholder="ID" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <i i-carbon-user />
        </InputGroupAddon>
        <InputText v-model="form.name" placeholder="姓名" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <i i-carbon-home />
        </InputGroupAddon>
        <Dropdown v-model:model-value="form.school" :options="schools" option-label="name" option-value="value" placeholder="学校" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <i i-carbon-type-pattern />
        </InputGroupAddon>
        <!-- <InputText placeholder="专业" /> -->
        <TreeSelect v-model="selectedMajor" :options="majors" placeholder="专业" selection-mode="single" />
      </InputGroup>

      <Button text-center :loading="status === 'pending'" @click="execute()">
        提交
      </Button>
    </div>
  </Dialog>
</template>
