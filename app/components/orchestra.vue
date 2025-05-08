<script setup lang="ts">
const props = defineProps<{
  indexes: Set<number>
}>()

const cells = ref<{
  id: string
  d: string
  type?: string
}[]>([])

const width = 300
const height = 175
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
          return 'violin1'
        }

        if ([1, 2].includes(i) && [9, 10, 11].includes(j)) {
          return 'violin2'
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
  <div>
    <svg
      width="100%"
      height="100%"
      :viewBox="`0 0 ${width} ${height}`"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        class="group stroke-1 stroke-(--ui-text-dimmed)/50"
        :data-cello="props.indexes.has(0)"
        :data-viola="props.indexes.has(1)"
        :data-violin1="props.indexes.has(2)"
        :data-violin2="props.indexes.has(3)"
      >
        <path
          v-for="cell in cells"
          :key="cell.id"
          :data-id="cell.id"
          :data-type="cell.type"
          :d="cell.d"
          style="vector-effect: non-scaling-stroke"
          class="transition-colors duration-500 fill-transparent data-[type=cello]:fill-info/10 data-[type=cello]:stroke-info/10 data-[type=cello]:group-data-[cello=true]:fill-info data-[type=cello]:group-data-[cello=true]:stroke-info-600 data-[type=cello]:group-data-[cello=true]:stroke-2 data-[type=viola]:fill-error/10 data-[type=viola]:stroke-error/10 data-[type=viola]:group-data-[viola=true]:fill-error data-[type=viola]:group-data-[viola=true]:stroke-error-600 data-[type=viola]:group-data-[viola=true]:stroke-2 data-[type=violin1]:fill-success/10 data-[type=violin1]:stroke-success/10 data-[type=violin1]:group-data-[violin1=true]:fill-success data-[type=violin1]:group-data-[violin1=true]:stroke-success-600 data-[type=violin1]:group-data-[violin1=true]:stroke-2 data-[type=violin2]:fill-warning/10 data-[type=violin2]:stroke-warning/10 data-[type=violin2]:group-data-[violin2=true]:fill-warning data-[type=violin2]:group-data-[violin2=true]:stroke-warning-600 data-[type=violin2]:group-data-[violin2=true]:stroke-2"
        />
      </g>

      <g>
        <circle
          :cx="startX"
          :cy="startY - 4"
          r="4"
          class="fill-(--ui-text)"
        />
      </g>

      <g
        class="group text-[0.5rem]"
        :data-cello="props.indexes.has(0)"
        :data-viola="props.indexes.has(1)"
        :data-violin1="props.indexes.has(2)"
        :data-violin2="props.indexes.has(3)"
      >
        <text
          x="229"
          y="122"
          class="fill-info/50 group-data-[cello=true]:fill-info-800"
          transform="rotate(68 229 122)"
        >
          Cello
        </text>

        <text
          x="174"
          y="78"
          class="fill-error/50 group-data-[viola=true]:fill-error-600"
          transform="rotate(24 174 78)"
        >
          Viola
        </text>

        <text
          x="100"
          y="90"
          class="fill-success/50 group-data-[violin1=true]:fill-success-800"
          transform="rotate(-23 100 90)"
        >
          Violin 2
        </text>

        <text
          x="61"
          y="148"
          class="fill-warning/50 group-data-[violin2=true]:fill-warning-800"
          transform="rotate(-67 61 148)"
        >
          Violin 1
        </text>
      </g>
    </svg>

    <OrchestraAudio :indexes="props.indexes" />
  </div>
</template>
