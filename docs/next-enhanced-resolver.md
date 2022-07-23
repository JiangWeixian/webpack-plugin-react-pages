# `nextEnhancedResolver`

`next.js` route convention mix `remix.js` route convention, check [examples/next-enhanced](./../examples/next-enhanced/src/pages/) for more details.

## usage

```js
const { WebpackPluginReactPages } = require('webpack-plugin-react-pages')
const { nextEnhancedResolver } = require('webpack-plugin-react-pages/resolver')

// in webpack.config.js
{
  plugins: [
    // ...
    new WebpackPluginReactPages({
      resolver: nextEnhancedResolver()
    }),
  ],
}
```

## route convention

### Basic Routing
Pages will automatically map files from your pages directory to a route with the same name:

- `src/pages/users.tsx` -> `/users`
- `src/pages/users/profile.tsx` -> `/users/profile`
- `src/pages/settings.tsx` -> `/settings`

### Index Routes

Files with the name index are treated as the index page of a route:

- `src/pages/index.tsx` -> `/`
- `src/pages/users/index.tsx` -> `/users`

### Dynamic Routes

Dynamic routes are denoted using square brackets. Both directories and pages can be dynamic:

- `src/pages/users/[id].tsx` -> `/users/:id (/users/one)`
- `src/pages/[user]/settings.tsx` -> `/:user/settings (/one/settings)`

### Layout Routes

File with same name with dir, same name file treated as layout route

- `src/pages/users/[id].tsx` -> `/users/:id (/users/one)`
- `src/pages/users.tsx` -> `layout` route of `/users/:id`

### Pathless Routes

Brorrowed from [remix](https://remix.run/docs/en/v1/guides/routing)

File with same name with dir, and file startwith `__`. Same name file treated as **pathless** layout route

- `src/pages/__auth/login.tsx` -> `/login`
- `src/pages/__auth.tsx` -> `layout` route of `/login`