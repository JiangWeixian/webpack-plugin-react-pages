module.exports = {
  plugins: [
    'rucksack-css',
    'postcss-import',
    'postcss-url',
    [
      'cssnano',
      {
        preset: 'advanced',
        autoprefixer: false,
      },
    ],
    'tailwindcss',
  ],
}
