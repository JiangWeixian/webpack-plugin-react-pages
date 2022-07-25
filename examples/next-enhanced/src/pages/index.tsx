import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="flex-1 hero bg-base-200 overflow-auto">
      <div className="hero-content flex-col gap-8 lg:flex-row-reverse">
        <div className="flex flex-col my-6 gap-2">
          <div className="link link-hover">
            <Link to="/">/</Link>
          </div>
          <div className="link link-hover">
            <Link to="/about">/about</Link>
          </div>
          <div className="link link-hover">
            <Link to="/post">/post</Link>
          </div>
          <div className="link link-hover">
            <Link to={`/user/${Math.floor(Math.random() * 100)}`}>/user/[id]</Link>
          </div>
          <div className="link link-hover">
            <Link to="/login">pathless</Link>
          </div>
          <div className="link link-hover">
            <Link to="/404">/404</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
