<script setup lang="ts">
import type { InstrumentWithoutAll } from '~~/shared/types'
import { Howl } from 'howler'

const { state: syncState } = useSyncState()
const keys: InstrumentWithoutAll[] = ['cello', 'viola', 'violin2', 'violin1']
const audios: Record<InstrumentWithoutAll, Howl> = {
  cello: new Howl({ src: 'cello.opus' }),
  viola: new Howl({ src: 'viola.opus' }),
  violin2: new Howl({ src: 'violin2.opus' }),
  violin1: new Howl({ src: 'violin1.opus' }),
}

const { pause: pauseFn, resume: resumeFn } = useIntervalFn(() => {
  const max = Math.max(...keys.flatMap(k => audios[k].playing() ? [audios[k].seek()] : []))
  if (Number.isFinite(max)) {
    syncState.value.time = max
  }
}, 10, { immediate: false })

function play(instrument: InstrumentWithoutAll) {
  resumeFn()

  const audio = audios[instrument]
  audio.seek(syncState.value.time)

  audio.play()
}

function pause(instrument: InstrumentWithoutAll) {
  const audio = audios[instrument]
  audio.pause()

  if (Object.values(audios).every(x => !x.playing())) {
    pauseFn()
  }
}

watch(() => syncState.value.instruments, (s) => {
  for (const k of keys) {
    if (s[k].playing && !audios[k].playing()) {
      play(k)
    }

    if (!s[k].playing && audios[k].playing()) {
      pause(k)
    }

    if (audios[k].playing()) {
      audios[k].volume(s[k].volume / 100)
      audios[k].rate(s[k].speed)
    }
  }
}, { deep: true, flush: 'post' })

onUnmounted(() => {
  for (const k of keys) {
    audios[k].stop()
    audios[k].unload()
  }
})
</script>

<template>
  <div />
</template>
