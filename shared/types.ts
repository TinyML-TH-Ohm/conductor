import type { COMMAND_LABELS, INSTRUMENT_LABELS } from './constants'

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

export type Command = typeof COMMAND_LABELS[keyof typeof COMMAND_LABELS]
export type Instrument = typeof INSTRUMENT_LABELS[keyof typeof INSTRUMENT_LABELS]
export type InstrumentWithoutAll = Exclude<Instrument, 'all'>

export interface StateInstrument {
  volume: number
  speed: number
  playing: boolean
}

export interface SyncState {
  time: number
  instrument: InstrumentWithoutAll | undefined
  instruments: Record<InstrumentWithoutAll, StateInstrument>
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
  threshold: number
  last: {
    label: Command | Instrument | undefined
    score: number
  }
}

export type DrawCanvasPrediction = ({
  type: 'command'
  label: Command
}
| {
  type: 'instrument'
  label: Instrument
}) & {
  score: number
}
