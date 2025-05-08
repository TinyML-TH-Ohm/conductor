<script setup lang="ts">
const props = defineProps<{
  indexes: Set<number>
}>()

const instruments = ref<{
  id: number
  name: string
  el: HTMLAudioElement | undefined
  src: string
  color: string
}[]>([
  {
    id: 0,
    name: 'Cello',
    el: undefined,
    src: '/audios/cello.mp3',
    color: 'info',
  },
  {
    id: 1,
    name: 'Viola',
    el: undefined,
    src: '/audios/viola.mp3',
    color: 'error',
  },
  {
    id: 2,
    name: 'Violin 1',
    el: undefined,
    src: '/audios/violin1.mp3',
    color: 'warning',
  },
  {
    id: 3,
    name: 'Violin 2',
    el: undefined,
    src: '/audios/violin2.mp3',
    color: 'success',
  },
])
const currentTime = shallowRef(0)

watch(() => props.indexes, (ids) => {
  for (const ins of instruments.value) {
    if (!ins.el)
      continue

    if (ids.has(ins.id)) {
      ins.el.currentTime = currentTime.value + 0.1
      ins.el.play()
    }
    else {
      ins.el.pause()
    }
  }
}, { deep: true, flush: 'post' })

function updateTime(event: Event) {
  const el = event.target as HTMLAudioElement
  if (el.played && el.currentTime > currentTime.value) {
    currentTime.value = el.currentTime
  }
}
</script>

<template>
  <div class="card grid grid-rows-4 gap-4 p-4">
    <UButton
      v-for="ins in instruments"
      :key="ins.id"
      :color="ins.color as any"
      :disabled="!props.indexes.has(ins.id)"
      variant="subtle"
      block
      class="text-xl "
    >
      {{ ins.name }}
    </UButton>

    <audio
      v-for="ins in instruments"
      :key="ins.id"
      :ref="(el) => ins.el = el as HTMLAudioElement"
      :src="ins.src"
      class="sr-only disabled:opacity-50"
      preload="auto"
      @timeupdate="updateTime"
    />

    <p>{{ currentTime }}</p>
  </div>
</template>
