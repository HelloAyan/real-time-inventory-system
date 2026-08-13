import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Header from '../components/layout/Header'
import DropCard from '../components/dashboard/DropCard'
import { logout } from '../features/auth/authSlice'
import { mockDrops } from '../data/mockDrops'

export default function DashboardPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userName = useSelector((state) => state.auth.user?.username)

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header userName={userName} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mockDrops.map((drop) => (
            <DropCard key={drop.id} drop={drop} />
          ))}
        </div>
      </main>
    </div>
  )
}
