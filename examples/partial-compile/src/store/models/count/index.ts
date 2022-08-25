import { createModel } from '@rematch/core'
import type { RootModel } from '../index'

export const count = createModel<RootModel>()({
  state: 0,
  reducers: {
    increment(state, payload: number) {
      return state + payload
    },
  },
  effects: (dispatch) => ({
    incrementAsync(payload: number) {
      dispatch.count.increment(payload)
    },
  }),
})
