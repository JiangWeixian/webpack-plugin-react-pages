const { aiou } = require('@aiou/eslint-config')

module.exports = aiou({
  ssr: false,
  regexp: false,
}, [
  {
    ignores: [
      '**test/fixtures/**',
      '**/vite-plugin-pages-types.ts',
      '**/react-env.d.ts',
      '**/examples/**',
    ],
  },
  {
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
])
