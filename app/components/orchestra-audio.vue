<script setup lang="ts">
const props = defineProps<{
  indexes: Set<number>
}>()

const instruments = ref<{
  id: number
  key: string
  name: string
  el: HTMLAudioElement | undefined
  src: string
  color: string
}[]>([
  {
    id: 0,
    key: 'cello',
    name: 'Cello',
    el: undefined,
    src: '/audios/cello.mp3',
    color: 'info',
  },
  {
    id: 1,
    key: 'viola',
    name: 'Viola',
    el: undefined,
    src: '/audios/viola.mp3',
    color: 'error',
  },
  {
    id: 2,
    key: 'violin2',
    name: 'Violin 2',
    el: undefined,
    src: '/audios/violin2.mp3',
    color: 'success',
  },
  {
    id: 3,
    key: 'violin1',
    name: 'Violin 1',
    el: undefined,
    src: '/audios/violin1.mp3',
    color: 'warning',
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
  <div>
    <audio
      v-for="ins in instruments"
      :key="ins.id"
      :ref="(el) => ins.el = el as HTMLAudioElement"
      :src="ins.src"
      class="sr-only disabled:opacity-50"
      preload="auto"
      @timeupdate="updateTime"
    />
  </div>
</template>
