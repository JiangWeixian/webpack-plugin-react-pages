# webpack-plugin-react-pages
> Webpack plugin port of [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)

*Only support react, check playground for more details. Plugin use remix route style by default.*

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

```ts
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

### TypeScript

make `virutal:react-pages` type safe.

```json
{
  "types": ["webpack-plugin-react-pages/shim"]
}
```

