<script setup lang="ts">
const { state: localState } = useLocalState()
const { state: syncState } = useSyncState()

const cells = ref<{
  id: string
  d: string
  type?: string
}[]>([])

const width = 300
const height = 110
const arcs = 4
const lines = 12
const startX = width / 2
const startY = height * 0.95
const radius = Math.min(width / 2, startY)

function draw() {
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
          return 'violin2'
        }

        if ([1, 2].includes(i) && [9, 10, 11].includes(j)) {
          return 'violin1'
        }
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
</script>

<template>
  <div class="relative">
    <svg
      width="100%"
      height="100%"
      :viewBox="`0 0 ${width} ${height}`"
      xmlns="http://www.w3.org/2000/svg"
      class="transition-opacity"
      :class="{ 'opacity-50 dark:opacity-30': localState.muted }"
    >
      <g
        class="group stroke-2 stroke-(--ui-border)"
        :data-cello="syncState.instruments.cello.playing"
        :data-viola="syncState.instruments.viola.playing"
        :data-violin2="syncState.instruments.violin2.playing"
        :data-violin1="syncState.instruments.violin1.playing"
      >
        <path
          v-for="cell in cells"
          :key="cell.id"
          :data-id="cell.id"
          :data-type="cell.type"
          :d="cell.d"
          style="vector-effect: non-scaling-stroke"
          class="transition-colors duration-500 fill-transparent"
          :class="[
            // eslint-disable-next-line vue/prefer-separate-static-class
            'data-[type=cello]:fill-info/15 data-[type=cello]:stroke-info/15 data-[type=cello]:group-data-[cello=true]:fill-info data-[type=cello]:group-data-[cello=true]:stroke-info-600 data-[type=cello]:group-data-[cello=true]:stroke-2',
            // eslint-disable-next-line vue/prefer-separate-static-class
            'data-[type=viola]:fill-error/15 data-[type=viola]:stroke-error/15 data-[type=viola]:group-data-[viola=true]:fill-error data-[type=viola]:group-data-[viola=true]:stroke-error-600 data-[type=viola]:group-data-[viola=true]:stroke-2',
            // eslint-disable-next-line vue/prefer-separate-static-class
            'data-[type=violin2]:fill-success/15 data-[type=violin2]:stroke-success/15 data-[type=violin2]:group-data-[violin2=true]:fill-success data-[type=violin2]:group-data-[violin2=true]:stroke-success-600 data-[type=violin2]:group-data-[violin2=true]:stroke-2',
            // eslint-disable-next-line vue/prefer-separate-static-class
            'data-[type=violin1]:fill-warning/15 data-[type=violin1]:stroke-warning/15 data-[type=violin1]:group-data-[violin1=true]:fill-warning data-[type=violin1]:group-data-[violin1=true]:stroke-warning-600 data-[type=violin1]:group-data-[violin1=true]:stroke-2',
          ]"
        />
      </g>

      <g>
        <template v-if="localState.drawing">
          <line
            :x1="startX" :y1="startY - 5" :x2="startX" :y2="startY - 15"
            class="stroke-1 stroke-[#9775fa] origin-bottom animate-swing-left"
          />

          <line
            :x1="startX" :y1="startY - 5" :x2="startX" :y2="startY - 15"
            class="stroke-1 stroke-[#9775fa] origin-bottom animate-swing-right"
          />
        </template>

        <circle
          :cx="startX"
          :cy="startY"
          r="4"
          class="fill-transparent stroke-2 transition-[transform,stroke] duration-300 ease-in-out"
          :class=" localState.drawing ? 'stroke-(--ui-text) translate-y-[1px]' : 'stroke-(--ui-border) translate-y-[-2px]'"
          style="vector-effect: non-scaling-stroke"
        />
      </g>

      <g
        class="group text-[0.3rem] font-bold"
        :data-cello="syncState.instruments.cello.playing"
        :data-viola="syncState.instruments.viola.playing"
        :data-violin2="syncState.instruments.violin2.playing"
        :data-violin1="syncState.instruments.violin1.playing"
      >
        <text
          x="205"
          y="74"
          class="fill-info/50 group-data-[cello=true]:fill-info-900"
          transform="rotate(68 205 74)"
        >
          Cello
        </text>

        <text
          x="167"
          y="44"
          class="fill-error/50 group-data-[viola=true]:fill-error-700"
          transform="rotate(24 167 44)"
        >
          Viola
        </text>

        <text
          x="116"
          y="52"
          class="fill-success/50 group-data-[violin2=true]:fill-success-900"
          transform="rotate(-23 116 52)"
        >
          Violin 2
        </text>

        <text
          x="87"
          y="90"
          class="fill-warning/50 group-data-[violin1=true]:fill-warning-900"
          transform="rotate(-70 87 90)"
        >
          Violin 1
        </text>
      </g>
    </svg>

    <HallAudio v-if="!localState.muted" />
  </div>
</template>
