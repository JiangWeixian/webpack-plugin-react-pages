import React, { useCallback, useState } from 'react'
import RouterViewer from '@/routes'
import { DarkIcon, LightIcon } from '@/components/Icons'

import './App.css'

const App = () => {
  const [theme, setTheme] = useState<'night' | 'light'>('night')
  const handleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'night' ? 'light' : 'night'))
    const html = document.querySelector('html')
    const prev = html?.getAttribute('data-theme')
    html.setAttribute('data-theme', prev === 'night' ? 'light' : 'night')
  }, [])
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-0 sticky top-0 z-30 flex h-16 w-full justify-end items-center px-8 bg-opacity-90 backdrop-blur transition-all duration-100 text-primary-content">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn bg-transparent border-none">
            {theme === 'light' ? <LightIcon /> : <DarkIcon />}
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
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
      <RouterViewer />
    </div>
  )
}

export default App
