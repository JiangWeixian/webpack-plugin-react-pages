declare module 'virtual:react-pages' {
  import type { RouteObject } from 'react-router'

  const Pages: RouteObject[]
  export default Pages
}

declare module '~react-pages' {
  // eslint-disable-next-line import/no-duplicates
  import type { RouteObject } from 'react-router'

  const routes: RouteObject[]
  export default routes
}

declare module 'virtual:generated-pages-react' {
  // eslint-disable-next-line import/no-duplicates
  import type { RouteObject } from 'react-router'

  const routes: RouteObject[]
  export default routes
}
