<script setup lang="ts">
// const props = defineProps<{
//   state: State
// }>()

const instruments = ref<{
  key: string
  el: HTMLAudioElement | undefined
  src: string
}[]>([
  {
    key: 'cello',
    el: undefined,
    src: '/audios/cello.mp3',
  },
  {
    key: 'viola',
    el: undefined,
    src: '/audios/viola.mp3',
  },
  {
    key: 'violin2',
    el: undefined,
    src: '/audios/violin2.mp3',
  },
  {
    key: 'violin1',
    el: undefined,
    src: '/audios/violin1.mp3',
  },
])

function test(event: Event) {
  const target = event.target as HTMLAudioElement
  console.log(target.currentTime)
}
</script>

<template>
  <div>
    <audio
      v-for="instrument in instruments"
      :key="instrument.key"
      :ref="(el) => instrument.el = el as HTMLAudioElement"
      :src="instrument.src"
      class="sr-only"
      preload="auto"
    />

    <audio
      src="/audios/cello.mp3"
      controls
      @timeupdate="test"
    />
  </div>
</template>
