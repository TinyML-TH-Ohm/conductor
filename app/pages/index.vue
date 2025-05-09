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

const cm = useColorMode()
</script>

<template>
  <div class="max-w-[1200px] mx-auto font-mono rounded overflow-hidden p-4 flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl flex justify-between">
        <UIcon name="i-lucide:chef-hat" class="text-success size-7" /><span>rchestra Conductor</span>
      </h1>

      <div class="flex gap-2">
        <UButton
          icon="i-lucide:github"
          variant="soft"
          size="sm"
          to="https://github.com/chubetho/Orchestra_Conductor"
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
        Orchestra:
      </p>
      <Orchestra
        :indexes="logs.indexes"
        class=""
      />

      <UBadge
        class="absolute top-4 right-4 font-semibold rounded-full"
        :color="logs.connected ? 'success' : 'error'"
        variant="soft"
      >
        {{ logs.connected ? 'connected' : 'disconnected' }}
      </UBadge>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="card p-4">
        <DrawCanvas
          :connected="logs.connected"
          :prediction="logs.prediction"
          @connect="logs.connected = true"
          @predict="onPredict"
        />
      </div>

      <div class="card p-4 flex flex-col gap-4">
        <p class="font-extrabold">
          Logs:
        </p>
        <div>
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

      <div class="card p-4 flex flex-col gap-4">
        <p class="font-extrabold">
          Notes:
        </p>
        <p class="text-warning">
          - Only 0 (cello), 1 (viola), 2 (violin 1) or 3 (violin 2) are supported.
        </p>
      </div>
    </div>
  </div>
</template>
