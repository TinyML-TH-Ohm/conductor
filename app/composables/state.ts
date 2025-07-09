import type { LocalState, SyncState } from '~~/shared/types'

export function useSyncState() {
  const _default: SyncState = {
    time: 0,
    instrument: undefined,
    instruments: {
      cello: {
        volume: 50,
        speed: 0.5,
        playing: false,
      },
      violin1: {
        volume: 50,
        speed: 0.5,
        playing: false,
      },
      violin2: {
        volume: 50,
        speed: 0.5,
        playing: false,
      },
      viola: {
        volume: 50,
        speed: 0.5,
        playing: false,
      },
      all: {
        volume: 50,
        speed: 0.5,
        playing: false,
      },
    },
  }

  const state = useLocalStorage(
    'sync-state',
    () => structuredClone(_default),
    { flush: 'post' },
  )

  const reset = () => {
    state.value = structuredClone(_default)
  }

  return { state, reset }
}

export function useLocalState() {
  const _default: LocalState = {
    name: undefined,
    type: undefined,
    uuids: undefined,
    connected: false,
    drawing: false,
    muted: false,
    threshold: 60,
    last: {
      label: undefined,
      score: 0,
    },
  }

  const state = useState(
    'local-state',
    () => structuredClone(_default),
  )

  const reset = () => {
    state.value = structuredClone(_default)
  }

  return { state, reset }
}
