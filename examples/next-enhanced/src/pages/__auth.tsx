import React from 'react'
import { Outlet } from 'react-router'

const Home = () => {
  return (
    <div className="flex-1 hero bg-base-200 overflow-auto">
      __auth
      <Outlet />
    </div>
  )
}

export default Home
