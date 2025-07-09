export const COMMAND_SERVICE_UUID = '74696e79-6d6c-3235-1000-74696e796d6c'
export const COMMAND_BLE_STROKE_UUID = '74696e79-6d6c-3235-1001-74696e796d6c'
export const COMMAND_BLE_PREDICTION_UUID = '74696e79-6d6c-3235-1002-74696e796d6c'

export const INSTRUMENT_SERVICE_UUID = '74696e79-6d6c-3235-0000-74696e796d6c'
export const INSTRUMENT_BLE_STROKE_UUID = '74696e79-6d6c-3235-0001-74696e796d6c'
export const INSTRUMENT_BLE_PREDICTION_UUID = '74696e79-6d6c-3235-0002-74696e796d6c'

export const COMMAND_LABELS = {
  0: 'volume down', // <
  1: 'volume up', // >
  2: 'speed down', // v
  3: 'speed up', // ^
} as const

export const INSTRUMENT_LABELS = {
  0: 'violin1', // |
  1: 'violin2', // —
  2: 'viola', // △
  3: 'cello', // ◯
  4: 'all', // □
} as const

export const COMMAND_POINTS_STORAGE_KEY = 'command_points'
export const INSTRUMENT_POINTS_STORAGE_KEY = 'instrument_points'
