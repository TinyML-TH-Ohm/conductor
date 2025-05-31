<script setup lang="ts">
import type { Command, State } from '~~/shared/types'
import { BLE_PREDICTION_UUID, BLE_STROKE_UUID, SERVICE_UUID } from '~~/shared/constants'

const state = useState<State>('state', () => ({
  connected: false,
  last: {
    command: undefined,
    score: 0,
  },
  instrument: undefined,
  time: 0,
  instruments: {
    cello: {
      playing: false,
      volume: 100,
    },
    violin1: {
      playing: false,
      volume: 100,
    },
    violin2: {
      playing: false,
      volume: 100,
    },
    viola: {
      playing: false,
      volume: 100,
    },
  },
}))

function onPredict(v: { command: Command, score: number }) {
  const instruments = state.value.instruments

  switch (v.command) {
    case 'on':{
      if (state.value.instrument) {
        instruments[state.value.instrument].playing = true
      }
      break
    }

    case 'off': {
      if (state.value.instrument) {
        instruments[state.value.instrument].playing = false
      }
      break
    }

    case 'volume down':{
      if (state.value.instrument) {
        const volume = instruments[state.value.instrument].volume
        instruments[state.value.instrument].volume = Math.max(0, volume - 25)
      }
      break
    }

    case 'volume up':{
      if (state.value.instrument) {
        const volume = instruments[state.value.instrument].volume
        instruments[state.value.instrument].volume = Math.max(0, volume + 25)
      }
      break
    }

    case 'cello':
    case 'viola':
    case 'violin1':
    case 'violin2':
    {
      state.value.instruments[v.command].playing = true
      state.value.instrument = v.command
      break
    }
  }

  state.value.last = v
}

const cm = useColorMode()
</script>

<template>
  <div class="max-w-[1200px] mx-auto font-mono rounded overflow-hidden p-4 flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl flex justify-between">
        <UIcon name="i-lucide:chef-hat" class="text-success size-7" /><span>rchestra Conductor</span>
      </h1>

      <div class="flex gap-2">
        <UButton
          icon="i-lucide:github"
          variant="soft"
          size="sm"
          to="https://github.com/TinyML-TH-Ohm/conductor"
          target="_blank"
        />

        <UButton
          :icon="cm.preference === 'light' ? 'i-lucide:sun' : 'i-lucide:moon'"
          size="sm"
          variant="soft"
          @click="cm.preference = cm.preference === 'light' ? 'dark' : 'light'"
        />
      </div>
    </div>

    <div class="card p-4 relative max-h-[600px]">
      <p class="font-extrabold">
        Hall:
      </p>
      <Hall />

      <UBadge
        class="absolute top-4 right-4 font-semibold rounded-full"
        :color="state.connected ? 'success' : 'error'"
        variant="soft"
      >
        {{ state.connected ? 'connected' : 'disconnected' }}
      </UBadge>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="card p-4">
        <DrawCanvas
          @predict="onPredict"
        />
      </div>

      <div class="card p-4 flex flex-col gap-4">
        <p class="font-extrabold">
          State:
        </p>

        <div class="text-sm flex gap-1">
          <span class="text-dimmed">Last command:</span>
          <span>{{ state.last.command }}</span>
          <span class="text-dimmed">| {{ state.last.score }}%</span>
        </div>

        <div class="grid gap-1.5">
          <span class="text-sm text-dimmed">Instruments:</span>
          <table class="rounded ring ring-muted">
            <thead class="border-b border-muted">
              <tr class="*:py-1 *:px-2">
                <th class="text-left">
                  type
                </th>
                <th class="text-center">
                  volume
                </th>
                <th class="text-right">
                  playing
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="[k, v] in Object.entries(state.instruments)"
                :key="k"
                class="*:py-1 *:px-2"
                :class="{ 'text-success': state.instrument === k }"
              >
                <td class="text-left">
                  {{ k }}
                </td>
                <td class="text-center">
                  {{ v.volume }}%
                </td>
                <td
                  class="group flex justify-end items-center"
                  :data-playing="v.playing"
                >
                  &nbsp;
                  <div class="rounded-full size-2 transition-colors bg-error group-data-[playing=true]:bg-success mr-[3ch]" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card p-4 flex flex-col gap-4 text-xs">
        <p class="font-extrabold text-base">
          Info:
        </p>
        <div class="grid gap-1">
          <span class="text-dimmed">Service UUID: </span>
          <span>{{ SERVICE_UUID }}</span>
        </div>
        <div class="grid gap-1">
          <span class="text-dimmed">Stroke UUID: </span>
          <span>{{ BLE_STROKE_UUID }}</span>
        </div>
        <div class="grid gap-1">
          <span class="text-dimmed">Prediction UUID: </span>
          <span>{{ BLE_PREDICTION_UUID }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
