import {
  Suspense,
  useCallback,
  useState,
} from 'react'
import {
  BrowserRouter,
  Link,
  useRoutes,
} from 'react-router-dom'

import { DarkIcon, LightIcon } from '@/components/Icons'

import routes from 'virtual:react-pages'

console.log(routes)

const Routes = () => {
  const element = useRoutes(routes)
  return element
}

const RouterViewer = () => {
  const [theme, setTheme] = useState<'light' | 'night'>('night')
  const handleTheme = useCallback(() => {
    setTheme(prev => (prev === 'night' ? 'light' : 'night'))
    const html = document.querySelector('html')
    const prev = html?.getAttribute('data-theme')
    html.setAttribute('data-theme', prev === 'night' ? 'light' : 'night')
  }, [])
  return (
    <BrowserRouter>
      <div className="flex h-screen flex-col">
        <div className="flex-0 text-primary-content sticky top-0 z-30 flex h-16 w-full items-center justify-end bg-opacity-90 px-8 backdrop-blur transition-all duration-100">
          <div className="link link-hover text-slate-400">
            <Link to="/">Home</Link>
          </div>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn border-none bg-transparent">
              {theme === 'light' ? <LightIcon /> : <DarkIcon />}
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow"
            >
              <li onClick={handleTheme}>
                <a className="text-slate-400">
                  <LightIcon /> Light
                </a>
              </li>
              <li onClick={handleTheme}>
                <a className="text-slate-400">
                  <DarkIcon /> Dark
                </a>
              </li>
            </ul>
          </div>
        </div>
        <Suspense fallback={<div>loading</div>}>
          <Routes />
        </Suspense>
      </div>
    </BrowserRouter>
  )
}

export default RouterViewer
