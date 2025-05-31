<!-- eslint-disable unused-imports/no-unused-vars -->
<script setup lang="ts">
import type { Instrument, State } from '~~/shared/types'
import { Howl } from 'howler'

const state = useState<State>('state')
const keys: Instrument[] = ['cello', 'viola', 'violin2', 'violin1']
const audios: Record<Instrument, Howl> = {
  cello: new Howl({ src: '/audios/cello.opus' }),
  viola: new Howl({ src: '/audios/viola.opus' }),
  violin2: new Howl({ src: '/audios/violin2.opus' }),
  violin1: new Howl({ src: '/audios/violin1.opus' }),
}

let time = 0
const { pause: pauseFn, resume: resumeFn } = useIntervalFn(() => {
  const max = Math.max(...keys.flatMap(k => audios[k].playing() ? [audios[k].seek()] : []))
  if (Number.isFinite(max)) {
    time = max
  }
}, 10, { immediate: false })

function play(instrument: Instrument) {
  resumeFn()

  const audio = audios[instrument]
  audio.seek(time)

  audio.play()
  state.value.instruments[instrument].playing = true
}

function pause(instrument: Instrument) {
  const audio = audios[instrument]
  audio.pause()
  state.value.instruments[instrument].playing = false

  if (Object.values(audios).every(x => !x.playing())) {
    pauseFn()
  }
}
</script>

<template>
  <div>
    <!-- <div class="grid gap-2">
      <div class="flex gap-2">
        <UButton color="warning" @click="play('violin1')">
          Violin 1
        </UButton>
        <UButton color="success" @click="play('violin2')">
          Violin 2
        </UButton>
        <UButton color="error" @click="play('viola')">
          Viola
        </UButton>
        <UButton color="info" @click="play('cello')">
          Cello
        </UButton>
      </div>
      <div class="flex gap-2">
        <UButton color="warning" variant="soft" @click="pause('violin1')">
          Violin 1
        </UButton>
        <UButton color="success" variant="soft" @click="pause('violin2')">
          Violin 2
        </UButton>
        <UButton color="error" variant="soft" @click="pause('viola')">
          Viola
        </UButton>
        <UButton color="info" variant="soft" @click="pause('cello')">
          Cello
        </UButton>
      </div>
    </div> -->
  </div>
</template>
