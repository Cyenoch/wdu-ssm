<script setup lang="ts">
import type { TreeNode } from 'primevue/treenode'

const props = defineProps<{
  id: string
  name: string
  major: string
  admissionYear: number
  graduated: boolean
}>()
const emit = defineEmits<{
  succeed: []
}>()
const visible = defineModel<boolean>('visible', { default: false })
const toast = useToast()
const selectedMajor = ref<Record<string, boolean>>({
  [props.major]: true,
})

const form = ref({
  name: '',
  major: '',
  admissionYear: 0,
  graduated: false,
})

watch(props, (props) => {
  form.value = {
    ...toRaw(props),
  }
  selectedMajor.value = {
    [props.major]: true,
  }
}, { immediate: true })

const {
  execute,
  data,
  error,
  status,
} = useFetch('/api/contract/sm/student', {
  method: 'PATCH',
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
  <Dialog v-model:visible="visible" modal header="更新学生">
    <div col gap-4>
      <InputGroup>
        <InputGroupAddon>
          <i i-carbon-id />
        </InputGroupAddon>
        <InputText v-model="$props.id" readonly placeholder="ID" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <i i-carbon-user />
        </InputGroupAddon>
        <InputText v-model="form.name" placeholder="姓名" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <i i-carbon-type-pattern />
        </InputGroupAddon>
        <!-- <InputText placeholder="专业" /> -->
        <TreeSelect v-model="selectedMajor" :options="majors" placeholder="专业" selection-mode="single" />
      </InputGroup>

      <InputGroup justify-between>
        <label mr-2 vertical-mid>已毕业:</label>
        <InputSwitch v-model="form.graduated" vertical-mid />
      </InputGroup>

      <Button text-center :loading="status === 'pending'" @click="execute()">
        提交
      </Button>
    </div>
  </Dialog>
</template>
