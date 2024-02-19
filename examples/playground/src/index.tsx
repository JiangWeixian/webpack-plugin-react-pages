import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import App from './App'
import { store } from './store'

const $ROOT = document.querySelector('#app')
const root = createRoot($ROOT)

const renderApp = (Component: any) => {
  root.render(
    <Provider store={store}>
      <Component />
    </Provider>,
  )
}

document.addEventListener('DOMContentLoaded', () => {
  renderApp(App)
})
