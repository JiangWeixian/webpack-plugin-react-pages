import path from 'node:path'

import { PageContext } from 'vite-plugin-pages'
import {
  describe,
  expect,
  it,
} from 'vitest'

import { nextEnhancedResolver } from '../src/resolver'

const fixtures = (...args: string[]) => path.resolve(__dirname, './fixtures', ...args)

describe('custom-resolver', () => {
  it('next enhanced resolver', async () => {
    const page = new PageContext(
      {
        importMode: 'sync',
        resolver: nextEnhancedResolver() as any,
        dirs: ['react'],
      },
      fixtures(),
    )
    await page.searchGlob()
    const routes = await page.resolveRoutes()
    expect(routes).toMatchSnapshot()
  })
})
