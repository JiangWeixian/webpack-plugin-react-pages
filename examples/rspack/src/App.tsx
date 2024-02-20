import './App.css'

import { BrowserRouter, useRoutes } from 'react-router-dom'
import routes from 'virtual-react-pages'

const Routes = () => {
  const element = useRoutes(routes)
  return element
}

const RouterViewer = () => {
  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  )
}

export default RouterViewer
