import React from 'react'
import { useParams } from 'react-router-dom'

const Home = () => {
  const params = useParams<{ id: string }>()
  return <div className="flex-1 hero bg-base-200 overflow-auto">id: {params.id}</div>
}

export default Home
