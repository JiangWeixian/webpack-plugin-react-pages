import { Outlet } from 'react-router'

const Home = () => {
  return (
    <div className="hero bg-base-200 flex-1 overflow-auto">
      __auth
      <Outlet />
    </div>
  )
}

export default Home
