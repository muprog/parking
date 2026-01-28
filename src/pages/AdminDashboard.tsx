import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import AdminDashboard from '../components/AdminDashboard'
import { getDashboardStats } from '../data/data'
import Button from '../components/Button'
export default function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (user.role !== 'admin') {
      navigate('/operator/dashboard')
      return
    }

    const dashboardStats = getDashboardStats()
    setStats(dashboardStats)
    setLoading(false)
  }, [user, navigate])

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-xl'>Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-6'>
      <header className='mb-8'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
            <p className='text-gray-600 mt-1'>{user?.email}</p>
          </div>
          <div className='flex items-center gap-4'>
            <Button
              title='Logout'
              btnStyle='dashboard-btn-red'
              onClick={logout}
            />
          </div>
        </div>
      </header>
      <AdminDashboard stats={stats} />
    </div>
  )
}
