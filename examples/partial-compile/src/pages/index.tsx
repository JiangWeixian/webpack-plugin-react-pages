import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()
  return (
    <div className="flex-1 hero bg-base-200 overflow-auto">
      <div className="hero-content flex-col gap-8 lg:flex-row-reverse">
        <div className="flex flex-col my-6 gap-2">
          <div className="link link-hover">
            <Link to="/">/</Link>
          </div>
          <div className="link link-hover">
            <a
              onClick={() => {
                navigate(`/partial-compile/${Math.floor(Math.random() * 100)}`)
              }}
            >
              /partial-compile/random
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
