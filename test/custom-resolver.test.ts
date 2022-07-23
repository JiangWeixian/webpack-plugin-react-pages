import { PageContext } from 'vite-plugin-pages'
import path from 'path'
import { describe, it } from 'vitest'

import { reactResolver } from '../src/resolver'

const fixtures = (...args: string[]) => path.resolve(__dirname, './fixtures', ...args)

describe('custom-resolver', () => {
  it('TODO', async () => {
    const page = new PageContext(
      {
        importMode: 'sync',
        routeStyle: 'remix',
        resolver: reactResolver() as any,
        dirs: ['react'],
      },
      fixtures(),
    )
    await page.searchGlob()
    const routes = await page.resolveRoutes()
    console.log(routes)
    expect(routes).toMatchSnapshot()
  })
})
