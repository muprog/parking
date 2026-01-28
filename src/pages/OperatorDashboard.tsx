import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getOperatorData } from '../data/data'
import OperatorDashboard from '../components/OperatorDashboard'
import Button from '../components/Button'
export default function Dashboard() {
  const { user, logout } = useAuth()
  const [operatorData, setOperatorData] = useState<any>(null)

  useEffect(() => {
    if (user?.role === 'operator') {
      const operatorDashboardData = getOperatorData(user.id)
      setOperatorData(operatorDashboardData)
    }
  }, [user])

  if (!user) return <div>Loading...</div>

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-6'>
      <header className='mb-8 flex justify-between content-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>Dashboard</h1>
          <p>{user.email}</p>
        </div>
        <div>
          <Button
            title='Logout'
            btnStyle='dashboard-btn-red'
            onClick={logout}
          />
        </div>
      </header>

      {user.role === 'operator' && operatorData && (
        <OperatorDashboard operatorData={operatorData} />
      )}
    </div>
  )
}
