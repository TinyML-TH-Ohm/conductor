import type { LABELS } from './constants'

export interface Point {
  x: number
  y: number
}

export interface Features {
  stroke: {
    uuid: string
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
    uuid: string
    data: {
      index: number | undefined
      score: number | undefined
    }
    characteristic: BluetoothRemoteGATTCharacteristic | undefined
    onUpdate: () => void
  }
}

export type Command = typeof LABELS[keyof typeof LABELS]
export type Instrument = keyof State['instruments']

interface StateInstrument {
  volume: number
  speed: number
  playing: boolean
}

export interface State {
  connected: boolean
  last: {
    command: Command | undefined
    score: number
  }
  instrument: Instrument | undefined
  time: number
  instruments: {
    cello: StateInstrument
    violin1: StateInstrument
    violin2: StateInstrument
    viola: StateInstrument
  }
}
