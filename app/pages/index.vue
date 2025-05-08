<script setup lang="ts">
const logs = ref<{
  indexes: Set<number>
  index: number | undefined
  prediction: string | undefined
  score: number
  connected: boolean
}>({
  indexes: new Set(),
  index: undefined,
  prediction: undefined,
  score: 0,
  connected: false,
})

function onPredict(v: { index: number, label: string, score: number }) {
  logs.value.index = v.index
  logs.value.prediction = v.label
  logs.value.score = v.score

  if (v.score < 50)
    return

  if (![0, 1, 2, 3].includes(v.index))
    return

  if (logs.value.indexes.has(v.index)) {
    logs.value.indexes.delete(v.index)
    return
  }

  logs.value.indexes.add(v.index)
}
</script>

<template>
  <div class="container @container mx-auto font-mono rounded overflow-hidden p-4 grid gap-4">
    <h1 class="text-3xl my-4 flex justify-center">
      <UIcon name="i-lucide:chef-hat" />rchestra Conductor
    </h1>
    <div class="flex flex-col gap-4 @min-[800px]:flex-row">
      <div class="card p-4 relative">
        <DrawCanvas
          :connected="logs.connected"
          :prediction="logs.prediction"
          @connect="logs.connected = true"
          @predict="onPredict"
        />
      </div>

      <div class="grow flex flex-col gap-4">
        <div class="grid gap-4 p-4 card">
          <p class="font-extrabold">
            Logs:
          </p>
          <div>
            <p>- Connected: <span :class="logs.connected ? 'text-success' : 'text-error'">{{ logs.connected }}</span></p>
            <p>- Indexes: <span class="text-info">{{ Array.from(logs.indexes) }}</span></p>
            <p>- Index: <span class="text-info">{{ logs.index }}</span></p>
            <p>- Prediction: <span class="text-info">{{ logs.prediction }}</span></p>
            <p>
              - Score:
              <span
                :class="logs.score > 80 ? 'text-success' : logs.score > 50 ? 'text-warning' : 'text-error' "
              >
                {{ logs.score }}%
              </span>
            </p>
          </div>
        </div>

        <div class="card p-4 grow">
          <p class="font-extrabold">
            Orchestra:
          </p>
          <Orchestra :indexes="logs.indexes" />
        </div>
      </div>
    </div>

    <div class="card p-4 grid gap-4">
      <p class="font-extrabold">
        Notes:
      </p>
      <p class="text-warning">
        - Only 0 (cello), 1 (viola), 2 (violin 1) or 3 (violin 2) are supported.
      </p>
    </div>
  </div>
</template>
