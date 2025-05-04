<script setup lang="ts">
import type { Features, Point } from '~~/shared/types'

const MAX_RECORDS = 128
const STROKE_POINT_COUNT = 160
const SERVICE_UUID = '4798e0f2-0000-4d68-af64-8a8f5258404e'
const BLE_STROKE_UUID = '4798e0f2-300a-4d68-af64-8a8f5258404e'
const BLE_PREDICTION_UUID = '4798e0f2-300b-4d68-af64-8a8f5258404e'
const State = {
  WAITING: 0,
  DRAWING: 1,
  DONE: 2,
} as const

const LABELS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const STRUCTURE_MAP = {
  Int32: { fn: DataView.prototype.getInt32, bytes: 4 },
  StrokePoints: { fn: getStrokePoints, bytes: (STROKE_POINT_COUNT * 2 * 1) },
}

const canvas = useTemplateRef('canvas')

const features: Features = {
  stroke: {
    uuid: BLE_STROKE_UUID,
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
    uuid: BLE_PREDICTION_UUID,
    data: {
      index: undefined,
      score: undefined,
    },
    characteristic: undefined,
    onUpdate: onUpdatePrediction,
  },
}
const logs = shallowRef({
  index: -1,
  prediction: 'unknown',
  score: 0,
})

function onUpdateStroke() {
  const data = features.stroke.data
  const state = data.states.at(-1)!
  const length = data.lengths.at(-1)!
  const points = data.points.at(-1)!.slice(0, length)

  if ((state === State.DONE) && (features.stroke.previousState !== State.DONE)) {
    // TODO
  }
  features.stroke.previousState = state

  const _canvas = canvas.value!
  const ctx = _canvas.getContext('2d')!

  const width = _canvas.width
  const halfWidth = width / 2
  const height = _canvas.height
  const halfHeight = height / 2

  const style = getComputedStyle(document.documentElement)
  const bgClr = style.getPropertyValue('--background-color-default')
  const textClr = style.getPropertyValue('--ui-text')

  ctx.fillStyle = bgClr
  ctx.fillRect(0, 0, width, height)

  if (state === State.DRAWING) {
    ctx.strokeStyle = textClr
    ctx.beginPath()
    for (let i = 0; i < length; ++i) {
      const x = points[i].x
      const y = points[i].y
      const xCanvas = halfWidth + (x * halfWidth)
      const yCanvas = halfHeight - (y * halfHeight)

      if (i === 0) {
        ctx.moveTo(xCanvas, yCanvas)
      }
      else if (i === (length - 1)) {
        ctx.lineTo(xCanvas + 5, yCanvas + 5)
        ctx.lineTo(xCanvas - 5, yCanvas - 5)
        ctx.moveTo(xCanvas + 5, yCanvas - 5)
        ctx.moveTo(xCanvas - 5, yCanvas + 5)
      }
      else {
        ctx.lineTo(xCanvas, yCanvas)
      }
    }
    ctx.stroke()
  }
}

function onUpdatePrediction() {
  const index = features.prediction.data.index ?? -1
  const score = features.prediction.data.score ?? 0
  logs.value = {
    index,
    prediction: LABELS[index],
    score,
  }
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
    await features.prediction.characteristic.stopNotifications()
    features.prediction.characteristic = undefined
  }
}

async function connect() {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [SERVICE_UUID] }],
  })

  if (!device.gatt)
    return

  device.addEventListener('gattserverdisconnected', onDisconnect)

  const server = await device.gatt.connect()
  const service = await server.getPrimaryService(SERVICE_UUID)

  const keys = Object.keys(features) as (keyof typeof features)[]

  for (const k of keys) {
    features[k].characteristic = await service.getCharacteristic(features[k].uuid)

    if (k === 'stroke') {
      const columns = ['states', 'lengths', 'points'] as const
      features.stroke.polling = setInterval(async () => {
        if (features.stroke.isReading)
          return

        const data = await features.stroke.characteristic?.readValue()
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
</script>

<template>
  <div class="max-w-[1000px] mx-auto font-mono rounded overflow-hidden p-4 grid gap-4">
    <div class="flex gap-4">
      <div class="card">
        <canvas
          ref="canvas"
          width="600"
          height="600"
        />
      </div>

      <div class="grow flex flex-col gap-4">
        <div class="grid gap-4 p-4 card">
          <p class="font-extrabold">
            Logs:
          </p>
          <div>
            <p>- Prediction: {{ logs.prediction }}</p>
            <p>- Score: {{ logs.score }}%</p>
          </div>
        </div>

        <Audio :index="logs.index" class="grow" />
      </div>
    </div>

    <UButton size="xl" block @click="connect">
      Connect
    </UButton>

    <div class="card p-4 grid gap-4">
      <p class="font-extrabold">
        Notes:
      </p>
      <p class="text-warning">
        - Only 0, 1, or 2 are supported.
      </p>
    </div>
  </div>
</template>
