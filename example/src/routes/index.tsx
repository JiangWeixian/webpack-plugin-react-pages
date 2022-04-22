import React from 'react'
import { useRoutes, HashRouter } from 'react-router-dom'

import routes from 'virtual/routes'

console.log(routes)

const Element = () => {
  const element = useRoutes(routes)
  return element
}

const RouterViewer = () => {
  return (
    <HashRouter>
      <Element />
    </HashRouter>
  )
}

export default RouterViewer
