import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getDashboardStats, getOperatorData } from '../data/data'
import AdminDashboard from './AdminDashboard'
import OperatorDashboard from './OperatorDashboard'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [operatorData, setOperatorData] = useState<any>(null)

  useEffect(() => {
    if (user?.role === 'admin') {
      const dashboardStats = getDashboardStats()
      setStats(dashboardStats)
    } else if (user?.role === 'operator') {
      const operatorDashboardData = getOperatorData(user.id)
      setOperatorData(operatorDashboardData)
    }
  }, [user])

  if (!user) return <div>Loading...</div>

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-6'>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800'>
          Welcome, {user.name}!
        </h1>
        <p className='text-gray-600'>Car Parking Management System</p>
      </header>

      {user.role === 'admin' && stats && <AdminDashboard stats={stats} />}

      {user.role === 'operator' && operatorData && (
        <OperatorDashboard operatorData={operatorData} />
      )}
    </div>
  )
}
