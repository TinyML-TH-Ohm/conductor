<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  indexes: Set<number>
}>()

const instruments = ref<{
  id: number
  name: string
  ref: HTMLAudioElement | undefined
  src: string
  color: string
}[]>([
  {
    id: 0,
    name: 'Cello',
    ref: undefined,
    src: '/audios/cello.mp3',
    color: 'bg-info',
  },
  {
    id: 1,
    name: 'Viola',
    ref: undefined,
    src: '/audios/viola.mp3',
    color: 'bg-error',
  },
  {
    id: 2,
    name: 'Violin 1',
    ref: undefined,
    src: '/audios/violin1.mp3',
    color: 'bg-warning',
  },
  {
    id: 3,
    name: 'Violin 2',
    ref: undefined,
    src: '/audios/violin2.mp3',
    color: 'bg-success',
  },
])

watch(() => props.indexes, (ids) => {
  instruments.value.forEach((instrument) => {
    if (ids.has(instrument.id)) {
      instrument.ref?.play()
    }
    else {
      instrument.ref?.pause()
    }
  })
}, { deep: true, flush: 'post' })
</script>

<template>
  <div
    class="card grid grid-rows-4 gap-4 p-4 *:rounded *:transition-opacity *:duration-500 *:flex *:items-center *:justify-center *:text-xl *:text-inverted"
  >
    <div
      v-for="instrument in instruments"
      :key="instrument.id"
      :class="[
        instrument.color,
        props.indexes.has(instrument.id) ? 'opacity-100' : 'opacity-50']"
    >
      {{ instrument.name }}
    </div>

    <audio
      v-for="instrument in instruments"
      :key="instrument.id"
      :ref="(el) => instrument.ref = el as HTMLAudioElement"
      :src="instrument.src"
      class="sr-only"
    />
  </div>
</template>
