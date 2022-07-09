import React, { Suspense } from 'react'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import routes from 'virtual:react-pages'

console.log(routes)

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
