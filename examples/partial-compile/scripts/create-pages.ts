import { outputFileSync } from 'fs-extra'
import path from 'path'

const template = (content) => `
import React from 'react'
import { Link } from 'react-router-dom'

const Page = () => {
  return (
    <div className="flex-1 hero bg-base-200 overflow-auto">
      <div className="hero-content flex-col gap-8 lg:flex-row-reverse">
        <div className="flex flex-col my-6 gap-2">
          ${content}
        </div>
      </div>
    </div>
  )
}

export default Page
`

const target = path.resolve(__dirname, '../src/pages/partial-compile')

const pages = new Array(100).fill(target).map((t, i) => path.resolve(t, `${i}.tsx`))

pages.forEach((page, index) => {
  outputFileSync(page, template(index))
})
