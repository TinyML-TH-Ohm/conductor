<script setup lang="ts">
const props = defineProps<{
  indexes: Set<number>
}>()

const cells = ref<{
  id: string
  d: string
  type: string
}[]>([])

const width = 300
const height = 175

function draw() {
  const arcs = 4
  const lines = 12
  const startX = width / 2
  const startY = height * 0.95
  const radius = Math.min(width / 2, startY)

  for (let i = 1; i < arcs; i++) {
    const r_in = (radius * i) / arcs
    const r_out = (radius * (i + 1)) / arcs

    for (let j = 0; j < lines; j++) {
      const angle1 = (Math.PI * j) / lines
      const angle2 = (Math.PI * (j + 1)) / lines

      const p1x = (startX + r_in * Math.cos(angle1)).toFixed(3)
      const p1y = (startY - r_in * Math.sin(angle1)).toFixed(3)
      const p2x = (startX + r_out * Math.cos(angle1)).toFixed(3)
      const p2y = (startY - r_out * Math.sin(angle1)).toFixed(3)
      const p3x = (startX + r_out * Math.cos(angle2)).toFixed(3)
      const p3y = (startY - r_out * Math.sin(angle2)).toFixed(3)
      const p4x = (startX + r_in * Math.cos(angle2)).toFixed(3)
      const p4y = (startY - r_in * Math.sin(angle2)).toFixed(3)

      const d = `M ${p1x} ${p1y} L ${p2x} ${p2y} A ${r_out} ${r_out} 0 0 1 ${p3x} ${p3y} L ${p4x} ${p4y} A ${r_in} ${r_in} 0 0 0 ${p1x} ${p1y} Z`

      const type = (() => {
        if ([1, 2].includes(i) && [0, 1, 2].includes(j)) {
          return 'cello'
        }

        if ([1].includes(i) && [3, 4, 5].includes(j)) {
          return 'viola'
        }

        if ([1, 2, 3].includes(i) && [6, 7, 8].includes(j)) {
          return 'violin1'
        }

        if ([1, 2].includes(i) && [9, 10, 11].includes(j)) {
          return 'violin2'
        }

        return ''
      })()

      cells.value.push({
        id: `cell-${i}-${j}`,
        d,
        type,
      })
    }
  }
}

onMounted(() => {
  draw()
})

const instruments = ref<{
  id: number
  key: string
  name: string
  el: HTMLAudioElement | undefined
  src: string
  color: string
}[]>([
  {
    id: 0,
    key: 'cello',
    name: 'Cello',
    el: undefined,
    src: '/audios/cello.mp3',
    color: 'info',
  },
  {
    id: 1,
    key: 'viola',
    name: 'Viola',
    el: undefined,
    src: '/audios/viola.mp3',
    color: 'error',
  },
  {
    id: 2,
    key: 'violin2',
    name: 'Violin 2',
    el: undefined,
    src: '/audios/violin2.mp3',
    color: 'success',
  },
  {
    id: 3,
    key: 'violin1',
    name: 'Violin 1',
    el: undefined,
    src: '/audios/violin1.mp3',
    color: 'warning',
  },
])
const currentTime = shallowRef(0)

watch(() => props.indexes, (ids) => {
  for (const ins of instruments.value) {
    if (!ins.el)
      continue

    if (ids.has(ins.id)) {
      ins.el.currentTime = currentTime.value + 0.1
      ins.el.play()
    }
    else {
      ins.el.pause()
    }
  }
}, { deep: true, flush: 'post' })

function updateTime(event: Event) {
  const el = event.target as HTMLAudioElement
  if (el.played && el.currentTime > currentTime.value) {
    currentTime.value = el.currentTime
  }
}
</script>

<template>
  <div>
    <svg
      width="100%"
      height="100%"
      :viewBox="`0 0 ${width} ${height}`"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="group stroke-(--ui-text-dimmed)/50"
      >
        <path
          v-for="cell in cells"
          :key="cell.id"
          :data-id="cell.id"
          :data-type="cell.type"
          :data-cello="props.indexes.has(0)"
          :data-viola="props.indexes.has(1)"
          :data-violin1="props.indexes.has(2)"
          :data-violin2="props.indexes.has(3)"
          :d="cell.d"
          style="vector-effect: non-scaling-stroke"
          class="transition-colors duration-500 fill-transparent data-[type=cello]:fill-info/10 data-[type=cello]:stroke-info/10 data-[type=cello]:data-[cello=true]:fill-info data-[type=cello]:data-[cello=true]:stroke-(--ui-color-info-600) dark:data-[type=cello]:data-[cello=true]:stroke-(--ui-color-info-500) data-[type=cello]:data-[cello=true]:stroke-2 data-[type=viola]:fill-error/10 data-[type=viola]:stroke-error/10 data-[type=viola]:data-[viola=true]:fill-error data-[type=viola]:data-[viola=true]:stroke-(--ui-color-error-600) dark:data-[type=viola]:data-[viola=true]:stroke-(--ui-color-error-500) data-[type=viola]:data-[viola=true]:stroke-2 data-[type=violin1]:fill-success/10 data-[type=violin1]:stroke-success/10 data-[type=violin1]:data-[violin1=true]:fill-success data-[type=violin1]:data-[violin1=true]:stroke-(--ui-color-success-600) dark:data-[type=violin1]:data-[violin1=true]:stroke-(--ui-color-success-500) data-[type=violin1]:data-[violin1=true]:stroke-2 data-[type=violin2]:fill-warning/10 data-[type=violin2]:stroke-warning/10 data-[type=violin2]:data-[violin2=true]:fill-warning data-[type=violin2]:data-[violin2=true]:stroke-(--ui-color-warning-600) dark:data-[type=violin2]:data-[violin2=true]:stroke-(--ui-color-warning-500) data-[type=violin2]:data-[violin2=true]:stroke-2"
        />
      </g>
    </svg>

    <audio
      v-for="ins in instruments"
      :key="ins.id"
      :ref="(el) => ins.el = el as HTMLAudioElement"
      :src="ins.src"
      class="sr-only disabled:opacity-50"
      preload="auto"
      @timeupdate="updateTime"
    />
  </div>
</template>
