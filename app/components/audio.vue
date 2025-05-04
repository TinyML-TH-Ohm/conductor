<script setup lang="ts">
const props = defineProps<{
  index: number
}>()

const files: Record<number, string> = {
  0: '/audios/0.mp3',
  1: '/audios/1.mp3',
  2: '/audios/2.mp3',
}
const src = computed(() => files[props.index])

const audio = useTemplateRef('audio')

watch(src, () => {
  if (!audio.value)
    return

  audio.value.play()
}, { flush: 'post' })
</script>

<template>
  <div
    :data-index="props.index"
    class="group card grid grid-rows-3 gap-4 p-4 *:rounded *:transition-opacity *:duration-500 *:flex *:items-center *:justify-center *:text-2xl *:text-inverted"
  >
    <div class="bg-info opacity-50 group-data-[index=0]:opacity-100">
      0
    </div>
    <div class="bg-error opacity-50 group-data-[index=1]:opacity-100">
      1
    </div>
    <div class="bg-warning opacity-50 group-data-[index=2]:opacity-100">
      2
    </div>
    <audio ref="audio" :src="src" class="sr-only" loop />
  </div>
</template>
