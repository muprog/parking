import { useParams, Link } from 'react-router-dom'
import { USERS } from '../data/users'
import { PARKING_AREAS } from '../data/parkingAreas'
import { PARKING_RECORDS } from '../data/parkingRecords'
import { DAILY_REPORTS } from '../data/reports'
import { getOperatorPerformance } from '../data/data'
import Button from '../components/Button'
import ProfileCard from '../components/ProfileCard'
import AreaCard from '../components/AreaCard'
import StatCard from '../components/StatCard'
import DetailCard from '../components/DetailCard'
import ActivityTable from '../components/ActivityTable'
import ShiftComparison from '../components/ShiftComparison'
import {
  TrendingUp,
  DollarSign,
  Car,
  UserCheck,
  AlertCircle,
  MapPin,
} from 'lucide-react'

export default function ViewOperator() {
  const { operatorId } = useParams<{ operatorId: string }>()

  const operator = USERS.find(
    (user) => user.id === operatorId && user.role === 'operator'
  )

  if (!operator) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='h-12 w-12 text-yellow-500 mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Operator Not Found
          </h1>
          <p className='text-gray-600 mb-6'>
            The operator you're looking for doesn't exist.
          </p>
          <Link to='/admin/operators'>
            <Button title='← Back to Operators' btnStyle='dashboard-btn-blue' />
          </Link>
        </div>
      </div>
    )
  }

  const assignedAreas = PARKING_AREAS.filter((area) =>
    operator.assignedParkingAreas?.includes(area.id)
  )

  const allOperatorsPerformance = getOperatorPerformance()
  const operatorPerformance = allOperatorsPerformance.find(
    (op) => op.id === operatorId
  )

  const areaIds = assignedAreas.map((area) => area.id)
  const operatorRecords = PARKING_RECORDS.filter((record) =>
    areaIds.includes(record.parkingAreaId)
  )
    .sort(
      (a, b) =>
        new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
    )
    .slice(0, 10)

  const todayRevenue = DAILY_REPORTS.filter(
    (report) =>
      report.date === '2024-01-15' && areaIds.includes(report.parkingAreaId)
  ).reduce((sum, report) => sum + report.totalRevenue, 0)

  const getShiftHours = (shift: string) => {
    switch (shift) {
      case 'morning':
        return '6:00 AM - 2:00 PM'
      case 'afternoon':
        return '2:00 PM - 10:00 PM'
      case 'night':
        return '10:00 PM - 6:00 AM'
      default:
        return 'Not specified'
    }
  }

  const currentlyParked = PARKING_RECORDS.filter(
    (record) =>
      areaIds.includes(record.parkingAreaId) && record.exitTime === null
  ).length

  const shiftComparisonData = ['morning', 'afternoon', 'night'].map((shift) => {
    const shiftOperators = allOperatorsPerformance.filter(
      (op) => op.shift === shift
    )
    const avgEfficiency =
      shiftOperators.length > 0
        ? Math.round(
            shiftOperators.reduce((sum, op) => sum + op.efficiency, 0) /
              shiftOperators.length
          )
        : 0

    return {
      shift,
      efficiency: avgEfficiency,
      operatorCount: shiftOperators.length,
      isCurrent: shift === operator.shift,
    }
  })

  return (
    <div className='space-y-8 p-8'>
      <div className='flex justify-between items-center'>
        <div>
          <Link
            to='/admin/operators'
            className='text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-2'
          >
            ← Back to Operators
          </Link>
          <h1 className='text-3xl font-bold text-gray-900'>Operator Details</h1>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-1 space-y-8'>
          <ProfileCard
            name={operator.name}
            role='Operator'
            email={operator.email}
            phone={operator.phone}
            shift={operator.shift || 'morning'}
            shiftHours={getShiftHours(operator.shift || 'morning')}
            initials={operator.name.charAt(0)}
          />

          <div className='bg-white rounded-2xl shadow-sm border p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
              <MapPin className='h-5 w-5' />
              Assigned Areas ({assignedAreas.length})
            </h3>

            <div className='space-y-4'>
              {assignedAreas.map((area) => (
                <AreaCard key={area.id} area={area} />
              ))}
            </div>
          </div>
        </div>

        <div className='lg:col-span-2 space-y-8'>
          <div className='bg-white rounded-2xl shadow-sm border p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Performance Overview
            </h3>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
              <StatCard
                title='Efficiency Score'
                value={`${operatorPerformance?.efficiency || 0}%`}
                color='blue'
                glow={true}
              />

              <StatCard
                title="Today's Revenue"
                value={`$${todayRevenue.toLocaleString()}`}
                color='green'
                glow={true}
              />

              <StatCard
                title='Total Vehicles'
                value={operatorPerformance?.totalVehiclesManaged || 0}
                color='purple'
                glow={true}
              />

              <StatCard
                title='Currently Parked'
                value={currentlyParked}
                color='yellow'
                glow={true}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <DetailCard
                title='Revenue Statistics'
                icon={<DollarSign className='h-4 w-4' />}
              >
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Total Revenue Generated</span>
                  <span className='font-medium text-green-600'>
                    $
                    {operatorPerformance?.totalRevenueGenerated.toLocaleString() ||
                      0}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Average Revenue/Day</span>
                  <span className='font-medium'>
                    ${todayRevenue.toLocaleString()}
                  </span>
                </div>
              </DetailCard>

              <DetailCard
                title='Vehicle Statistics'
                icon={<Car className='h-4 w-4' />}
              >
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Vehicles Managed Today</span>
                  <span className='font-medium'>
                    {
                      PARKING_RECORDS.filter(
                        (record) =>
                          areaIds.includes(record.parkingAreaId) &&
                          record.entryTime.startsWith('2024-01-15')
                      ).length
                    }
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Avg Vehicles/Day</span>
                  <span className='font-medium'>
                    {Math.round(
                      (operatorPerformance?.totalVehiclesManaged || 0) / 30
                    )}
                  </span>
                </div>
              </DetailCard>
            </div>
          </div>
          <div className='bg-white rounded-2xl shadow-sm border overflow-hidden'>
            <div className='p-6 border-b'>
              <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                <UserCheck className='h-5 w-5' />
                Recent Activity
              </h3>
            </div>

            <ActivityTable
              records={operatorRecords}
              areas={PARKING_AREAS}
              emptyMessage='No activity records found for this operator.'
            />
          </div>

          <div className='bg-white rounded-2xl shadow-sm border p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-6'>
              Shift Performance
            </h3>

            <ShiftComparison
              shifts={shiftComparisonData}
              currentShiftEfficiency={operatorPerformance?.efficiency || 0}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
