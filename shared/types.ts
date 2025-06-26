import type { LABELS } from './constants'

export interface Point {
  x: number
  y: number
}

export interface Features {
  stroke: {
    uuid: string | undefined
    structures: ('Int32' | 'StrokePoints')[]
    data: {
      states: number[]
      lengths: number[]
      points: (Point[])[]
    }
    characteristic: BluetoothRemoteGATTCharacteristic | undefined
    polling: NodeJS.Timeout | undefined
    isReading: boolean
    previousState: number
    onUpdate: () => void
  }
  prediction: {
    uuid: string | undefined
    data: {
      index: number | undefined
      score: number | undefined
    }
    characteristic: BluetoothRemoteGATTCharacteristic | undefined
    onUpdate: () => void
  }
}

export type Command = typeof LABELS[keyof typeof LABELS]
export type Instrument = keyof SyncState['instruments']

interface StateInstrument {
  volume: number
  speed: number
  playing: boolean
}

export interface SyncState {
  time: number
  instrument: Instrument | undefined
  instruments: {
    cello: StateInstrument
    violin1: StateInstrument
    violin2: StateInstrument
    viola: StateInstrument
  }
}

export interface LocalState {
  name: string | undefined
  type: 'instrument' | 'command' | undefined
  uuids: {
    service: string
    stroke: string
    prediction: string
  } | undefined
  connected: boolean
  drawing: boolean
  muted: boolean
  last: {
    command: Command | undefined
    score: number
  }
}
