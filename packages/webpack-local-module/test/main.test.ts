import {
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import { welcome } from '../src'

describe('index', () => {
  test('demo part', () => {
    console.log = vi.fn()
    welcome()
    expect(console.log).toHaveBeenCalledWith('hello world')
  })
})
