<script setup lang="ts">
import type { Command, Features, Point } from '~~/shared/types'
import {
  COMMAND_BLE_PREDICTION_UUID,
  COMMAND_BLE_STROKE_UUID,
  COMMAND_SERVICE_UUID,
  INSTRUMENT_BLE_PREDICTION_UUID,
  INSTRUMENT_BLE_STROKE_UUID,
  INSTRUMENT_SERVICE_UUID,
  LABELS,
} from '~~/shared/constants'

const emit = defineEmits<{
  predict: [v: { command: Command, score: number }]
}>()

const { state: localState } = useLocalState()

const MAX_RECORDS = 128
const STROKE_POINT_COUNT = 160
const STATE = {
  WAITING: 0,
  DRAWING: 1,
  DONE: 2,
} as const

const STRUCTURE_MAP = {
  Int32: { fn: DataView.prototype.getInt32, bytes: 4 },
  StrokePoints: { fn: getStrokePoints, bytes: (STROKE_POINT_COUNT * 2 * 1) },
}

const canvasEl = useTemplateRef('canvas')

const features: Features = {
  stroke: {
    uuid: undefined,
    structures: [
      'Int32',
      'Int32',
      'StrokePoints',
    ],
    data: {
      states: [],
      lengths: [],
      points: [],
    },
    characteristic: undefined,
    polling: undefined,
    isReading: false,
    previousState: 0,
    onUpdate: onUpdateStroke,
  },
  prediction: {
    uuid: undefined,
    data: {
      index: undefined,
      score: undefined,
    },
    characteristic: undefined,
    onUpdate: onUpdatePrediction,
  },
}

function onUpdateStroke() {
  const data = features.stroke.data
  const _state = data.states.at(-1)!
  const length = data.lengths.at(-1)!
  const points = data.points.at(-1)!.slice(0, length)

  if ((_state === STATE.DONE) && (features.stroke.previousState !== STATE.DONE)) {
    localState.value.drawing = false
  }
  features.stroke.previousState = _state

  const canvas = canvasEl.value!
  const ctx = canvas.getContext('2d')!

  const width = canvas.width
  const halfWidth = width / 2
  const height = canvas.height
  const halfHeight = height / 2

  const style = getComputedStyle(document.documentElement)
  const bgClr = style.getPropertyValue('--background-color-default')
  const textClr = style.getPropertyValue('--ui-text')

  ctx.fillStyle = bgClr
  ctx.fillRect(0, 0, width, height)

  if (_state === STATE.DRAWING) {
    localState.value.drawing = true
    ctx.strokeStyle = textClr
    ctx.beginPath()
    for (let i = 0; i < length; ++i) {
      const x = points[i].x
      const y = points[i].y
      const xCanvas = halfWidth + (x * halfWidth)
      const yCanvas = halfHeight - (y * halfHeight)

      if (i === 0) {
        ctx.moveTo(xCanvas, yCanvas)
        continue
      }

      ctx.lineTo(xCanvas, yCanvas)
    }
    ctx.stroke()
  }
}

function onUpdatePrediction() {
  const index = features.prediction.data.index ?? -1
  const command = LABELS[index as keyof typeof LABELS]
  const score = features.prediction.data.score ?? 0

  emit('predict', { command, score })
}

async function onDisconnect() {
  // Stroke
  if (features.stroke.polling) {
    clearInterval(features.stroke.polling)
  }
  features.stroke.polling = undefined
  features.stroke.characteristic = undefined

  // Prediction
  if (features.prediction.characteristic) {
    await features.prediction.characteristic?.stopNotifications()
    features.prediction.characteristic = undefined
    localState.value.connected = false
  }
}

async function connect() {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: 'TinyML' }],
    optionalServices: [
      INSTRUMENT_SERVICE_UUID,
      COMMAND_SERVICE_UUID,
    ],
  })

  if (!device.gatt)
    return

  localState.value.connected = true

  device.addEventListener('gattserverdisconnected', onDisconnect)

  await device.gatt.connect()
  const services = await device.gatt.getPrimaryServices()
  const filtered = services.filter(s => s.uuid === INSTRUMENT_SERVICE_UUID || s.uuid === COMMAND_SERVICE_UUID)
  const service = filtered.at(0)
  if (!service)
    return

  const isInstrument = service.uuid === INSTRUMENT_SERVICE_UUID

  localState.value.type = isInstrument ? 'instrument' : 'command'
  localState.value.uuids = isInstrument
    ? {
        service: INSTRUMENT_SERVICE_UUID,
        stroke: INSTRUMENT_BLE_STROKE_UUID,
        prediction: INSTRUMENT_BLE_PREDICTION_UUID,
      }
    : {
        service: COMMAND_SERVICE_UUID,
        stroke: COMMAND_BLE_STROKE_UUID,
        prediction: COMMAND_BLE_PREDICTION_UUID,
      }

  features.stroke.uuid = localState.value.uuids!.stroke
  features.prediction.uuid = localState.value.uuids!.prediction

  const keys = Object.keys(features) as (keyof typeof features)[]

  for (const k of keys) {
    features[k].characteristic = await service.getCharacteristic(features[k].uuid!)

    if (k === 'stroke') {
      const columns = ['states', 'lengths', 'points'] as const
      features.stroke.polling = setInterval(async () => {
        if (features.stroke.isReading)
          return

        let data: DataView | undefined
        try {
          data = await features.stroke.characteristic?.readValue()
        }
        catch {}

        if (!data)
          return

        features.stroke.isReading = true

        let pointer = 0
        let i = 0

        features.stroke.structures.forEach((structure) => {
          const unpackedValue = (() => {
            switch (structure) {
              case 'Int32':{
                const fn = STRUCTURE_MAP[structure].fn.bind(data)
                return fn(pointer, true)
              }
              case 'StrokePoints':{
                const fn = STRUCTURE_MAP[structure].fn
                return fn(data, pointer)
              }
            }
          })()

          const column = features.stroke.data[columns[i]]
          column.push(unpackedValue as any)
          if (column.length > MAX_RECORDS) {
            column.shift()
          }
          pointer += STRUCTURE_MAP[structure].bytes
          i++
        })

        features.stroke.onUpdate()
        features.stroke.isReading = false
      }, 200)
    }

    if (k === 'prediction') {
      features[k].characteristic.oncharacteristicvaluechanged = (event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic
        const data = target.value
        if (!data || data.byteLength !== 2)
          return

        const index = data.getInt8(0)
        const score = data.getUint8(1)

        features[k].data.index = index
        features[k].data.score = score

        features[k].onUpdate()
      }
      await features[k].characteristic.startNotifications()
    }
  }
}

function getStrokePoints(dataview: DataView<ArrayBufferLike>, byteOffset: number) {
  const result: Point[] = []
  let offset = byteOffset
  for (let i = 0; i < STROKE_POINT_COUNT; i++) {
    const x = dataview.getInt8(offset) / 128.0
    offset += 1
    const y = dataview.getInt8(offset) / 128.0
    offset += 1
    result.push({ x, y })
  }
  return result
}

onUnmounted(() => onDisconnect)

defineExpose({
  disconnect: onDisconnect,
})
</script>

<template>
  <div class="relative">
    <p class="font-extrabold">
      Draw:
    </p>

    <div
      v-if="!localState.connected"
      class="absolute z-10 inset-0 size-full flex-center"
    >
      <UButton
        size="lg"
        :disabled="localState.connected"
        variant="soft"
        @click="connect"
      >
        {{ localState.connected ? 'Connected' : 'Connect' }}
      </UButton>
    </div>

    <canvas
      ref="canvas"
      width="300"
      height="300"
      class="mx-auto"
    />
  </div>
</template>
