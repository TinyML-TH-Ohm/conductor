import type { State } from '~~/shared/types'

export function useAppState() {
  const state = useLocalStorage<State>('app-state', () => ({
    connected: false,
    drawing: false,
    last: {
      command: undefined,
      score: 0,
    },
    instrument: undefined,
    time: 0,
    instruments: {
      cello: {
        volume: 100,
        speed: 1.0,
        stereo: 0.0,
        playing: false,
      },
      violin1: {
        volume: 100,
        speed: 1.0,
        stereo: 0.0,
        playing: false,
      },
      violin2: {
        volume: 100,
        speed: 1.0,
        stereo: 0.0,
        playing: false,
      },
      viola: {
        volume: 100,
        speed: 1.0,
        stereo: 0.0,
        playing: false,
      },
    },
  }))

  return state
}
