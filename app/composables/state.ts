import type { LocalState, SyncState } from '~~/shared/types'

export function useSyncState() {
  const _default: SyncState = {
    time: 0,
    instruments: {
      cello: {
        volume: 100,
        speed: 1.0,
        playing: false,
      },
      violin1: {
        volume: 100,
        speed: 1.0,
        playing: false,
      },
      violin2: {
        volume: 100,
        speed: 1.0,
        playing: false,
      },
      viola: {
        volume: 100,
        speed: 1.0,
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
    type: undefined,
    uuids: undefined,
    connected: false,
    drawing: false,
    muted: false,
    last: {
      command: undefined,
      score: 0,
    },
    instrument: undefined,
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
