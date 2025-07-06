<script setup lang="ts">
import type { SelectItem } from '#ui/types'
import type { DrawCanvasPrediction, Instrument, StateInstrument } from '~~/shared/types'
import { upperFirst } from 'scule'
import {
  COMMAND_BLE_PREDICTION_UUID,
  COMMAND_BLE_STROKE_UUID,
  COMMAND_LABELS,
  COMMAND_SERVICE_UUID,
  INSTRUMENT_BLE_PREDICTION_UUID,
  INSTRUMENT_BLE_STROKE_UUID,
  INSTRUMENT_LABELS,
  INSTRUMENT_SERVICE_UUID,
} from '~~/shared/constants'

const { state: localState, reset: resetLocalState } = useLocalState()
const { state: syncState, reset: resetSyncState } = useSyncState()

type SelectItemBase = Extract<SelectItem, object>
const instructions: SelectItemBase[] = [
  {
    type: 'label',
    label: 'Instruments',
  },
  ...Object.values(INSTRUMENT_LABELS).map(l => ({
    type: 'item' as const,
    label: upperFirst(l),
    value: l,
    kind: 'instrument',
  })),
  {
    type: 'separator',
  },
  {
    type: 'label',
    label: 'Commands',
  },
  ...Object.values(COMMAND_LABELS).map(l => ({
    type: 'item' as const,
    label: upperFirst(l),
    value: l,
    kind: 'command',
  })),
]
const instruction = shallowRef<string>()
function onChangeInstruction() {
  const _instruction = instructions.find(i => i.type === 'item' && i.label === instruction.value)
  if (!_instruction)
    return

  onPredict({
    label: _instruction.value as any,
    score: 100,
    type: _instruction.kind as any,
    dev: true,
  })
}

function onPredict(v: DrawCanvasPrediction & { dev: boolean }) {
  const instruments = syncState.value.instruments

  localState.value.last = {
    label: v.label,
    score: v.score,
  }

  if (v.score < 75)
    return

  if (v.type === 'command') {
    switch (v.label) {
      case 'volume down':{
        if (syncState.value.instrument) {
          const volume = instruments[syncState.value.instrument].volume
          instruments[syncState.value.instrument].volume = Math.max(0, volume - 50)
        }
        break
      }

      case 'volume up':{
        if (syncState.value.instrument) {
          const volume = instruments[syncState.value.instrument].volume
          instruments[syncState.value.instrument].volume = Math.min(100, volume + 50)
        }
        break
      }

      case 'speed down':{
        if (syncState.value.instrument) {
          const speed = instruments[syncState.value.instrument].speed
          instruments[syncState.value.instrument].speed = Math.max(0.25, speed - 0.25)
        }
        break
      }

      case 'speed up':{
        if (syncState.value.instrument) {
          const speed = instruments[syncState.value.instrument].speed
          instruments[syncState.value.instrument].speed = Math.min(2.0, speed + 0.25)
        }
        break
      }
    }
  }
  else {
    switch (v.label) {
      case 'cello':
      case 'viola':
      case 'violin1':
      case 'violin2':
      {
        syncState.value.instrument = v.label
        syncState.value.instruments[v.label].playing = !syncState.value.instruments[v.label].playing
        break
      }

      case 'all':{
        syncState.value.instrument = undefined
        const entries = Object.entries(syncState.value.instruments) as [Instrument, StateInstrument][]
        const every = entries.every(([_, v]) => v.playing)
        entries.forEach(([_, v]) => v.playing = !every)
        break
      }
    }
  }
}

const cm = useColorMode()
const drawCanvas = useTemplateRef('draw-canvas')

function reset() {
  drawCanvas.value?.disconnect()
  resetLocalState()
  resetSyncState()
  instruction.value = undefined
}

onMounted(reset)
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
        <DrawCanvas ref="draw-canvas" @predict=" v => onPredict({ ...v, dev: false })" />
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
          <span class="text-dimmed">Last instruction:</span>
          <span>{{ localState.last.label }}</span>
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
                :class="{ 'text-success': syncState.instrument === k }"
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
              v-model="instruction"
              :items="instructions"
              size="sm"
              value-key="label"
              placeholder="Select instruction"
              class="grow"
              @blur="onChangeInstruction"
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
