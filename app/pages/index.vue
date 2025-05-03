<script setup lang="ts">
interface Point {
  x: number
  y: number
}

interface Ble {
  structures: ('Int32' | 'StrokePoints')[]
  data: {
    states: number[]
    lengths: number[]
    points: (Point[])[]
  }
  characteristic: BluetoothRemoteGATTCharacteristic | undefined
  polling: NodeJS.Timeout | undefined
  previousState: number
  onUpdate: () => void
}

const MAX_RECORDS = 128
const STROKE_POINT_COUNT = 160
const SERVICE_UUID = '4798e0f2-0000-4d68-af64-8a8f5258404e'
const BLE_STROKE_UUID = '4798e0f2-300a-4d68-af64-8a8f5258404e'

const btn = useTemplateRef('btn')
const canvas = useTemplateRef('canvas')

const ble: Ble = {
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
  previousState: 0,
  onUpdate,
}

const StructureMap = {
  Int32: { fn: DataView.prototype.getInt32, bytes: 4 },
  StrokePoints: { fn: getStrokePoints, bytes: (STROKE_POINT_COUNT * 2 * 1) },
}

function onUpdate() {
  const data = ble.data
  const length = data.lengths.at(-1)!
  const state = data.states.at(-1)!
  const points = data.points.at(-1)!.slice(0, length)

  if ((state === 2) && (ble.previousState !== 2)) {
    // TODO
  }
  ble.previousState = state

  const _canvas = canvas.value!
  const ctx = _canvas.getContext('2d')!

  const width = _canvas.width
  const halfWidth = width / 2
  const height = _canvas.height
  const halfHeight = height / 2

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)

  if (state === 1) {
    ctx.strokeStyle = '#fff'
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

async function connect() {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [SERVICE_UUID] }],
  })

  if (!device.gatt)
    return

  device.addEventListener('gattserverdisconnected', () => {
    if (ble.polling) {
      clearInterval(ble.polling)
      ble.polling = undefined
      ble.characteristic = undefined
    }
  })

  const server = await device.gatt.connect()
  const service = await server.getPrimaryService(SERVICE_UUID)
  ble.characteristic = await service.getCharacteristic(BLE_STROKE_UUID)
  const columns = ['states', 'lengths', 'points'] as const

  ble.polling = setInterval(async () => {
    const data = await ble.characteristic?.readValue()
    if (!data)
      return

    let pointer = 0
    let i = 0

    ble.structures.forEach((structure) => {
      const unpackedValue = (() => {
        switch (structure) {
          case 'Int32':{
            const fn = StructureMap[structure].fn.bind(data)
            return fn(pointer, true)
          }
          case 'StrokePoints':{
            const fn = StructureMap[structure].fn
            return fn(data, pointer)
          }
        }
      })()

      const column = ble.data[columns[i]]
      column.push(unpackedValue as any)
      if (column.length > MAX_RECORDS) {
        column.shift()
      }
      pointer += StructureMap[structure].bytes
      i++
    })

    ble.onUpdate()
  }, 200)
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

onMounted(() => {
  const _canvas = canvas.value!
  const ctx = _canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, _canvas.width, _canvas.height)
})
</script>

<template>
  <div>
    <UButton
      ref="btn"
      @click="connect"
    >
      Connect
    </UButton>

    <canvas
      ref="canvas"
      width="600"
      height="600"
    />
  </div>
</template>
