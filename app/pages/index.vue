<script setup lang="ts">
interface Point {
  x: number
  y: number
}

interface BleStroke {
  structure: ('Int32' | 'StrokePoints')[]
  data: {
    state: number[]
    length: number[]
    strokePoints: (Point[])[]
  }
  characteristic: BluetoothRemoteGATTCharacteristic | undefined
  polling: NodeJS.Timeout | undefined
  rendered: boolean
  onUpdate: () => void
}

const MAX_RECORDS = 64
const STROKE_POINT_COUNT = 160
const SERVICE_UUID = '4798e0f2-0000-4d68-af64-8a8f5258404e'
const BLE_STROKE_UUID = '4798e0f2-300a-4d68-af64-8a8f5258404e'

const btn = useTemplateRef('btn')
const canvas = useTemplateRef('canvas')

const bleStroke: BleStroke = {
  structure: [
    'Int32',
    'Int32',
    'StrokePoints',
  ],
  data: {
    state: [],
    length: [],
    strokePoints: [],
  },
  characteristic: undefined,
  polling: undefined,
  rendered: false,
  onUpdate: updateStrokeGraph,
}

async function connect() {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [SERVICE_UUID] }],
  })

  if (!device.gatt)
    return

  device.addEventListener('gattserverdisconnected', () => {
    if (bleStroke.polling) {
      clearInterval(bleStroke.polling)
      bleStroke.polling = undefined
    }
  })

  const server = await device.gatt.connect()
  const service = await server.getPrimaryService(SERVICE_UUID)
  bleStroke.characteristic = await service.getCharacteristic(BLE_STROKE_UUID)
  bleStroke.polling = setInterval(async () => {
    const data = await bleStroke.characteristic?.readValue()
    if (!data)
      return
    handleIncoming(data)
  }, 200)
}

function handleIncoming(dataRecieved: DataView<ArrayBufferLike>) {
  const columns = Object.keys(bleStroke.data) as (keyof typeof bleStroke.data)[]
  const typeMap = {
    Uint8: { fn: DataView.prototype.getUint8, bytes: 1 },
    Uint16: { fn: DataView.prototype.getUint16, bytes: 2 },
    Int32: { fn: DataView.prototype.getInt32, bytes: 4 },
    Float32: { fn: DataView.prototype.getFloat32, bytes: 4 },
    StrokePoints: { fn: getStrokePoints, bytes: (STROKE_POINT_COUNT * 2 * 1) },
  }

  let packetPointer = 0
  let i = 0

  bleStroke.structure.forEach((dataType) => {
    const unpackedValue = (() => {
      switch (dataType) {
        case 'Int32':{
          const fn = typeMap[dataType].fn.bind(dataRecieved)
          return fn(packetPointer, true)
        }
        case 'StrokePoints':{
          const fn = typeMap[dataType].fn
          return fn(dataRecieved, packetPointer)
        }
      }
    })()

    const column = bleStroke.data[columns[i]]
    column.push(unpackedValue as any)
    if (column.length > MAX_RECORDS) {
      column.shift()
    }
    packetPointer += typeMap[dataType].bytes
    i++
  })

  bleStroke.rendered = false
  bleStroke.onUpdate()
}

function getStrokePoints(dataview: DataView<ArrayBufferLike>, byteOffset: number) {
  const result: Point[] = []
  let currentOffset = byteOffset
  for (let i = 0; i < STROKE_POINT_COUNT; ++i) {
    const x = dataview.getInt8(currentOffset) / 128.0
    currentOffset += 1
    const y = dataview.getInt8(currentOffset) / 128.0
    currentOffset += 1
    result.push({ x, y })
  }
  return result
}

let previousStrokeState = 0

function updateStrokeGraph() {
  const strokeData = bleStroke.data
  const strokeDataLength = strokeData.length.at(-1)!
  const strokeState = strokeData.state.at(-1)!
  const strokePoints = strokeData.strokePoints.at(-1)!.slice(0, strokeDataLength)

  if ((strokeState === 2) && (previousStrokeState !== 2)) {
    // TODO
  }
  previousStrokeState = strokeState

  const _canvas = canvas.value!
  const ctx = _canvas.getContext('2d')!
  ctx.fillStyle = '#111111'
  ctx.fillRect(0, 0, _canvas.width, _canvas.height)

  if (strokeState === 1) {
    drawStrokeGraph(_canvas, strokePoints, strokeDataLength)
  }
}

function drawStrokeGraph(canvas: HTMLCanvasElement, strokePoints: Point[], strokeDataLength: number) {
  const ctx = canvas.getContext('2d')!

  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  const halfHeight = canvasHeight / 2
  const halfWidth = canvasWidth / 2

  ctx.strokeStyle = '#ffffff'
  ctx.beginPath()
  for (let i = 0; i < strokeDataLength; ++i) {
    const x = strokePoints[i].x
    const y = strokePoints[i].y
    const xCanvas = halfWidth + (x * halfWidth)
    const yCanvas = halfHeight - (y * halfHeight)

    if (i === 0) {
      ctx.moveTo(xCanvas, yCanvas)
    }
    else if (i === (strokeDataLength - 1)) {
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

onMounted(() => {
  const _canvas = canvas.value!
  const ctx = _canvas.getContext('2d')!
  ctx.fillStyle = '#111111'
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
