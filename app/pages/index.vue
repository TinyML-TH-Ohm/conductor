<script setup lang="ts">
import type { Command } from '~~/shared/types'
import {
  COMMAND_BLE_PREDICTION_UUID,
  COMMAND_BLE_STROKE_UUID,
  COMMAND_SERVICE_UUID,
  INSTRUMENT_BLE_PREDICTION_UUID,
  INSTRUMENT_BLE_STROKE_UUID,
  INSTRUMENT_SERVICE_UUID,
  LABELS,
} from '~~/shared/constants'

const { state: localState, reset: resetLocalState } = useLocalState()
const { state: syncState, reset: resetSyncState } = useSyncState()

const keys = Object.values(LABELS)
const key = shallowRef<typeof keys[number]>()

function onPredict(v: { command: Command, score: number }) {
  const instruments = syncState.value.instruments

  switch (v.command) {
    case 'on':{
      if (localState.value.instrument) {
        instruments[localState.value.instrument].playing = true
      }
      break
    }

    case 'off': {
      if (localState.value.instrument) {
        instruments[localState.value.instrument].playing = false
        localState.value.instrument = undefined
      }
      break
    }

    case 'cello':
    case 'viola':
    case 'violin1':
    case 'violin2':
    {
      localState.value.instrument = v.command
      syncState.value.instruments[v.command].playing = true
      break
    }

    case 'volume down':{
      if (localState.value.instrument) {
        const volume = instruments[localState.value.instrument].volume
        instruments[localState.value.instrument].volume = Math.max(0, volume - 50)
      }
      break
    }

    case 'volume up':{
      if (localState.value.instrument) {
        const volume = instruments[localState.value.instrument].volume
        instruments[localState.value.instrument].volume = Math.min(100, volume + 50)
      }
      break
    }

    case 'speed down':{
      if (localState.value.instrument) {
        const speed = instruments[localState.value.instrument].speed
        instruments[localState.value.instrument].speed = Math.max(0.25, speed - 0.25)
      }
      break
    }

    case 'speed up':{
      if (localState.value.instrument) {
        const speed = instruments[localState.value.instrument].speed
        instruments[localState.value.instrument].speed = Math.min(2.0, speed + 0.25)
      }
      break
    }
  }

  localState.value.last = v
}

const cm = useColorMode()
const drawCanvas = useTemplateRef('draw-canvas')

function reset() {
  drawCanvas.value?.disconnect()
  resetLocalState()
  resetSyncState()
}
</script>

<template>
  <div class="max-w-[1200px] mx-auto font-mono rounded overflow-hidden p-4 flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl flex items-center gap-2">
        <span class="flex items-start text-success">
          <UIcon
            name="i-lucide:chef-hat"
            class="size-7 -mr-0.5"
          />
          rchestra
        </span>

        <span> Conductor</span>
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
        :color="localState.connected ? 'success' : 'error'"
        variant="soft"
      >
        {{ localState.connected ? 'connected' : 'disconnected' }}
      </UBadge>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="card p-4">
        <DrawCanvas ref="draw-canvas" @predict="onPredict" />
      </div>

      <div class="card p-4 flex flex-col gap-4">
        <div class="flex justify-between items-center">
          <p class="font-extrabold">
            State:
          </p>

          <div class="flex items-center gap-2">
            <UButton
              :icon="localState.muted ? `i-lucide-volume-off` : `i-lucide-volume-2`"
              square
              color="warning"
              :variant="localState.muted ? 'solid' : 'subtle'"
              size="sm"
              @click="localState.muted = !localState.muted"
            />

            <UButton
              icon="i-lucide-rotate-ccw"
              square
              color="error"
              variant="subtle"
              size="sm"
              @click="reset"
            />
          </div>
        </div>

        <div class="text-sm flex gap-1">
          <span class="text-dimmed">Last command:</span>
          <span>{{ localState.last.command }}</span>
          <span class="text-dimmed">| {{ localState.last.score }}%</span>
        </div>

        <div class="grid gap-1.5">
          <span class="text-sm text-dimmed">Instruments:</span>
          <table class="rounded ring ring-muted text-sm">
            <thead class="border-b border-muted">
              <tr class="*:py-1 *:px-2">
                <th class="text-left">
                  type
                </th>
                <th class="text-center">
                  volume
                </th>
                <th class="text-center">
                  speed
                </th>
                <th class="text-right">
                  playing
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="[k, v] in Object.entries(syncState.instruments)"
                :key="k"
                class="*:py-1 *:px-2"
                :class="{ 'text-success': localState.instrument === k }"
              >
                <td class="text-left">
                  {{ k }}
                </td>
                <td class="text-center">
                  {{ v.volume }}%
                </td>
                <td class="text-center">
                  {{ v.speed.toFixed(2) }}x
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

        <div class="grid gap-1.5">
          <span class="text-sm text-dimmed">DEV:</span>

          <div class="flex items-center gap-4">
            <USelect
              v-model="key"
              :items="keys"
              size="sm"
              placeholder="Select command"
              class="grow"
              @blur="key ? onPredict({ command: key, score: 100 }) : undefined"
            />

            <span class="text-sm">
              {{ syncState.time.toFixed(2) }}s
            </span>
          </div>
        </div>
      </div>

      <div class="card grid grid-cols-2 p-4 gap-4">
        <div class="flex flex-col gap-4 text-xs">
          <p class="font-extrabold text-base">
            Instrument:
          </p>

          <uuid label="Service UUID" :value="INSTRUMENT_SERVICE_UUID" />
          <uuid label="Stroke UUID" :value="INSTRUMENT_BLE_STROKE_UUID" />
          <uuid label="Prediction UUID" :value="INSTRUMENT_BLE_PREDICTION_UUID" />
        </div>

        <div class="flex flex-col gap-4 text-xs">
          <p class="font-extrabold text-base">
            Command:
          </p>

          <uuid label="Service UUID" :value="COMMAND_SERVICE_UUID" />
          <uuid label="Stroke UUID" :value="COMMAND_BLE_STROKE_UUID" />
          <uuid label="Prediction UUID" :value="COMMAND_BLE_PREDICTION_UUID" />
        </div>
      </div>

      <div class="card p-4 flex flex-col gap-4 text-xs">
        <p class="font-extrabold text-base">
          Notes:
        </p>
        <div class="grid gap-1">
          <span class="text-dimmed">WIP: </span>
          <span>- speed gestures</span>
        </div>
      </div>
    </div>
  </div>
</template>
