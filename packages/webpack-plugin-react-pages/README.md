# webpack-plugin-react-pages
> Webpack plugin port of [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)

*Only support react, check playground for more details. Plugin use remix route style by default.*

[![npm](https://img.shields.io/npm/v/webpack-plugin-react-pages)](https://github.com/JiangWeixian/webpack-plugin-react-pages/tree/master) [![GitHub](https://img.shields.io/npm/l/webpack-plugin-react-pages)](https://github.com/JiangWeixian/webpack-plugin-react-pages/tree/master)

## install

```console
pnpm i webpack-plugin-react-pages react-router react-router-dom
```

## usage

```js
const { WebpackPluginReactPages } = require('webpack-plugin-react-pages')

// in webpack.config.js
{
  plugins: [
    // ...
    new WebpackPluginReactPages(),
  ],
}
```

Then, import `virutal:react-pages` module in project

```tsx
import React, { Suspense } from 'react'
import { BrowserRouter, useRoutes } from 'react-router-dom'

import routes from 'virtual:react-pages'

const Routes = () => {
  const element = useRoutes(routes)
  return element
}

const RouterViewer = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>loading</div>}>
        <Routes />
      </Suspense>
    </BrowserRouter>
  )
}

export default RouterViewer
```

### options

Support follow options from [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)

- `resolver`
- `dirs`
- `exclude`
- `importMode`
- `routeStyle` - `remix` by default
- `caseSensitive`
- `routeBlockLang`
- `extendRoute`
- `onRoutesGenerated`
- `onClientGenerated`

`options.rspack`

- type `boolean`
  
compatible with `rspack`

`options.localModuleOptions`

- type check [webpack-local-module#options](https://www.npmjs.com/package/webpack-local-module) for more details

only worked when `options.rspack` is enabled.

`options.namespace`

plugin will register `$page` instance on `compiler` by default, custom `namespace`, register instance on `compiler[namespace].$page`

### TypeScript

make `virutal:react-pages` type safe.

```json
{
  "types": ["webpack-plugin-react-pages/shim"]
}
```

### built-in resolvers

`webpack-plugin-react-pages` also built-in custom resolvers

- [nextEnhancedResolver](./docs/next-enhanced-resolver.md) - [`next.js`](https://nextjs.org/) route convention mixup [`remix`](https://remix.run/docs/en/v1/guides/routing) route convention
