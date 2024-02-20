import {
  describe,
  expect,
  it,
} from 'vitest'

import { resolveId } from '../src/utils'

describe('utils', () => {
  it('resolve id', () => {
    expect(resolveId('/node_modules/vm')).toBe('vm')
    expect(resolveId('node_modules/vm')).toBe('vm')
    expect(resolveId(`${process.cwd()}/node_modules/vm`)).toBe('vm')
    expect(resolveId('/vm')).toBe('vm')
  })
})
