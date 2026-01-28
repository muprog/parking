import { Link } from 'react-router-dom'
import { USERS } from '../data/users'
import { getOperatorPerformance } from '../data/data'
import { Search, Filter, Users } from 'lucide-react'
import { useState } from 'react'
import StatCard from '../components/StatCard'
import OperatorCard from '../components/OperatorCard'

export default function OperatorsList() {
  const operators = USERS.filter((user) => user.role === 'operator')
  const operatorPerformance = getOperatorPerformance()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterShift, setFilterShift] = useState<string>('all')

  const combinedOperators = operators.map((operator) => {
    const performance = operatorPerformance.find(
      (perf) => perf.id === operator.id
    )
    return {
      ...operator,
      performance: performance || {
        id: operator.id,
        name: operator.name,
        email: operator.email,
        assignedAreasCount: operator.assignedParkingAreas?.length || 0,
        totalVehiclesManaged: 0,
        totalRevenueGenerated: 0,
        efficiency: 0,
        shift: operator.shift || 'morning',
      },
    }
  })

  const filteredOperators = combinedOperators.filter((operator) => {
    const matchesSearch =
      operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesShift = filterShift === 'all' || operator.shift === filterShift

    return matchesSearch && matchesShift
  })

  // Calculate stats for StatCard components
  const totalOperators = operators.length
  const activeToday = operators.length // Assuming all are active today
  const avgEfficiency =
    operatorPerformance.length > 0
      ? Math.round(
          operatorPerformance.reduce((sum, op) => sum + op.efficiency, 0) /
            operatorPerformance.length
        )
      : 0
  const totalRevenue = operatorPerformance.reduce(
    (sum, op) => sum + op.totalRevenueGenerated,
    0
  )

  return (
    <div className='space-y-8 p-8'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Operators</h1>
          <p className='text-gray-600'>
            Manage and monitor your parking operators
          </p>
        </div>
      </div>

      {/* Stats - Using StatCard component */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          title='Total Operators'
          value={totalOperators}
          color='blue'
          glow={true}
        />

        <StatCard
          title='Active Today'
          value={activeToday}
          color='green'
          glow={true}
          change='All operators active'
        />

        <StatCard
          title='Avg Efficiency'
          value={`${avgEfficiency}%`}
          color='yellow'
          glow={true}
          change={
            avgEfficiency >= 80
              ? '+Good'
              : avgEfficiency >= 60
              ? '+Average'
              : '-Needs Improvement'
          }
        />

        <StatCard
          title='Total Revenue'
          value={`$${totalRevenue.toLocaleString()}`}
          color='purple'
          glow={true}
        />
      </div>

      {/* Search and Filter Section */}
      <div className='bg-white rounded-xl border p-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search operators by name or email...'
                className='w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-gray-400' />
            <select
              className='border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
            >
              <option value='all'>All Shifts</option>
              <option value='morning'>Morning Shift</option>
              <option value='afternoon'>Afternoon Shift</option>
              <option value='night'>Night Shift</option>
            </select>
          </div>
        </div>
      </div>

      {/* Operators Grid - Using OperatorCard component */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredOperators.map((operator) => (
          <Link
            key={operator.id}
            to={`/admin/operators/${operator.id}`}
            className='block no-underline hover:no-underline'
          >
            <OperatorCard operator={operator.performance} />
          </Link>
        ))}

        {/* Empty State */}
        {filteredOperators.length === 0 && (
          <div className='col-span-full text-center py-12'>
            <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No operators found
            </h3>
            <p className='text-gray-600'>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
