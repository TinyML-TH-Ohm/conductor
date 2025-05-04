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
