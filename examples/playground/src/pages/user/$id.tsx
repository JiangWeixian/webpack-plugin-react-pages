import { useParams } from 'react-router-dom'

const Home = () => {
  const params = useParams<{ id: string }>()
  return <div className="hero bg-base-200 flex-1 overflow-auto">id: {params.id}</div>
}

export default Home
