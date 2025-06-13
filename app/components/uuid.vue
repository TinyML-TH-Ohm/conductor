<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string
}>()

const p = computed(() => {
  const _1 = props.value.slice(0, 19)
  const _2 = props.value.slice(19, 23)
  const _3 = props.value.slice(23)

  return h('div', null, [
    h('span', null, _1),
    h('span', { class: 'font-bold text-warning' }, _2),
    h('span', null, _3),
  ])
})
</script>

<template>
  <div class="grid gap-1">
    <span class="text-dimmed">{{ props.label }}: </span>
    <component :is="p" />
  </div>
</template>
