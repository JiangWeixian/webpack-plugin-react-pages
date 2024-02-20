# webpack-local-module
> write virtual module into disk

[![npm](https://img.shields.io/npm/v/webpack-local-module)](https://github.com/JiangWeixian/webpack-local-module) [![GitHub](https://img.shields.io/npm/l/webpack-local-module)](https://github.com/JiangWeixian/webpack-local-module)

## install

```console
pnpm i webpack-local-module -D
```

## usage

register plugin in `config`

```ts
const rspack = require('@rspack/core')
const { WebpackLocalModule } = require('webpack-local-module')

/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
  // ...other config
  plugins: [
    new WebpackLocalModule({
      'virtual-module': 'export const id = "virtual-module"',
    }),
  ],
}
```

import `virtual-module` in project, e.g.

```js
import vm from 'virtual-module'
```

## options

`options.dirname`

- type `string`
- default `.rlm`

plugin write module content into `<root>/node_modules/.rlm` dir by default

# 
<div align='right'>

*built with ❤️ by 😼*

</div>

