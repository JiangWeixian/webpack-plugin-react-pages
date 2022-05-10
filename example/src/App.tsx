import React, { Suspense } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import { hot } from 'react-hot-loader/root'
import RouterViewer from '@/routes'
// import './App.styl'

const App = () => {
  return (
    <Suspense fallback={<div>loading</div>}>
      <div className="app">
        this is react-simple webpack template
        <RouterViewer />
      </div>
    </Suspense>
  )
}

export default hot(App)
