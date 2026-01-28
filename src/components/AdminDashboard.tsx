import { PARKING_AREAS, getOperatorPerformance } from '../data/data'
import StatCard from './StatCard'
import Button from './Button'
import OperatorCard from './OperatorCard'
import { DashboardStats } from '../types/types'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import AreaDetailModal from './AreaDetailModal'

interface AdminDashboardProps {
  stats: DashboardStats
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)

  const getOccupancyColor = (rate: number): 'green' | 'yellow' | 'red' => {
    if (rate < 75) return 'green'
    if (rate < 90) return 'yellow'
    return 'red'
  }

  const operatorPerformance = getOperatorPerformance()

  const handleCloseModal = () => {
    setSelectedAreaId(null)
  }

  const handleAreaClick = (areaId: string) => {
    setSelectedAreaId(areaId)
  }

  return (
    <div className='space-y-10'>
      {/* Modal component */}
      {selectedAreaId && (
        <AreaDetailModal areaId={selectedAreaId} onClose={handleCloseModal} />
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6'>
        <StatCard title='Total Areas' value={stats.totalAreas} color='blue' />
        <StatCard
          title='Occupancy Rate'
          value={`${stats.occupancyRate}%`}
          color={getOccupancyColor(stats.occupancyRate)}
        />
        <StatCard
          title="Today's Revenue"
          value={`$${stats.todayRevenue.toLocaleString()}`}
          color='purple'
        />
        <StatCard
          title='Active Operators'
          value={stats.activeOperators}
          color='green'
        />
        <StatCard
          title='Top Performer'
          value={`${stats.topPerformerEfficiency}%`}
          color='yellow'
          subtitle={stats.topPerformerName}
        />
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
        <div className='xl:col-span-2 space-y-8'>
          <section className='bg-white rounded-2xl shadow-sm border p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-6'>
              Quick Actions
            </h2>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <Link to={'/admin/reports'}>
                <Button
                  title='📊 View Reports'
                  btnStyle='dashboard-btn-green w-full'
                />
              </Link>
            </div>
          </section>

          <section className='bg-white rounded-2xl shadow-sm border p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Operators Performance
              </h2>
              <span className='text-sm text-gray-500'>
                {operatorPerformance.length} active operators
              </span>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {operatorPerformance.map((operator) => (
                <OperatorCard key={operator.id} operator={operator} />
              ))}
            </div>
            <div className='mt-6 pt-6 border-t'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-semibold text-gray-900'>
                    {operatorPerformance.length}
                  </div>
                  <div className='text-sm text-gray-500'>Total Operators</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-semibold text-green-600'>
                    $
                    {Math.round(
                      operatorPerformance.reduce(
                        (sum, op) => sum + op.totalRevenueGenerated,
                        0
                      )
                    ).toLocaleString()}
                  </div>
                  <div className='text-sm text-gray-500'>Total Revenue</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-semibold text-blue-600'>
                    {operatorPerformance.length > 0
                      ? Math.round(
                          operatorPerformance.reduce(
                            (sum, op) => sum + op.totalVehiclesManaged,
                            0
                          ) / operatorPerformance.length
                        )
                      : 0}
                  </div>
                  <div className='text-sm text-gray-500'>Avg Vehicles</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-semibold text-yellow-600'>
                    {operatorPerformance.length > 0
                      ? Math.round(
                          operatorPerformance.reduce(
                            (sum, op) => sum + op.efficiency,
                            0
                          ) / operatorPerformance.length
                        )
                      : 0}
                    %
                  </div>
                  <div className='text-sm text-gray-500'>Avg Efficiency</div>
                </div>
              </div>
            </div>
          </section>

          <section className='bg-white rounded-2xl shadow-sm border p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-6'>
              Parking Areas
            </h2>

            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              {PARKING_AREAS.map((area) => {
                const percent = (area.currentOccupancy / area.totalSpaces) * 100

                return (
                  <div
                    key={area.id}
                    className='rounded-xl border p-4 hover:shadow-md transition cursor-pointer' // Added cursor-pointer
                    onClick={() => handleAreaClick(area.id)} // Added onClick
                  >
                    <div className='flex justify-between items-center'>
                      <h3 className='font-medium text-gray-800'>{area.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          area.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {area.status}
                      </span>
                    </div>

                    <div className='mt-4'>
                      <div className='flex justify-between text-sm text-gray-500 mb-1'>
                        <span>
                          {area.currentOccupancy}/{area.totalSpaces}
                        </span>
                        <span>{percent.toFixed(0)}%</span>
                      </div>

                      <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-blue-500 rounded-full'
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className='bg-white rounded-2xl shadow-sm border overflow-hidden'>
            <div className='p-6'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Area Status Overview
              </h2>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50 text-gray-600'>
                  <tr>
                    <th className='px-6 py-3 text-left'>Area</th>
                    <th className='px-6 py-3 text-left'>Capacity</th>
                    <th className='px-6 py-3 text-left'>Occupied</th>
                    <th className='px-6 py-3 text-left'>Rate</th>
                    <th className='px-6 py-3 text-left'>Status</th>
                  </tr>
                </thead>

                <tbody className='divide-y'>
                  {PARKING_AREAS.map((area) => {
                    const percent =
                      (area.currentOccupancy / area.totalSpaces) * 100

                    return (
                      <tr
                        key={area.id}
                        className='hover:bg-gray-50 cursor-pointer'
                        onClick={() => handleAreaClick(area.id)}
                      >
                        <td className='px-6 py-4'>
                          <div className='font-medium text-gray-900'>
                            {area.name}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {area.location}
                          </div>
                        </td>
                        <td className='px-6 py-4'>{area.totalSpaces}</td>
                        <td className='px-6 py-4'>
                          {area.currentOccupancy} ({percent.toFixed(0)}%)
                        </td>
                        <td className='px-6 py-4'>
                          ${area.hourlyRate.toFixed(2)}
                        </td>
                        <td className='px-6 py-4'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              area.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {area.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className='space-y-8'>
          <section className='bg-white rounded-2xl shadow-sm border p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>
              Operator Management
            </h2>
            <div className='space-y-3'>
              <Link to='/admin/operators'>
                <Button
                  title='📋 View All Operators'
                  btnStyle='dashboard-btn-gray hover:opacity-50'
                  fullWidth
                />
              </Link>
            </div>

            <div className='mt-6 pt-6 border-t'>
              <h3 className='text-sm font-medium text-gray-700 mb-3'>
                Shift Distribution
              </h3>
              <div className='space-y-2'>
                {['morning', 'afternoon', 'night'].map((shift) => {
                  const count = operatorPerformance.filter(
                    (op) => op.shift === shift
                  ).length
                  return (
                    <div
                      key={shift}
                      className='flex justify-between items-center'
                    >
                      <span className='text-sm text-gray-600 capitalize'>
                        {shift}
                      </span>
                      <span className='font-medium'>{count} operators</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className='mt-6 pt-6 border-t'>
              <h3 className='text-sm font-medium text-gray-700 mb-3'>
                Performance Overview
              </h3>
              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='text-gray-600'>Average Efficiency</span>
                    <span className='font-medium'>
                      {operatorPerformance.length > 0
                        ? Math.round(
                            operatorPerformance.reduce(
                              (sum, op) => sum + op.efficiency,
                              0
                            ) / operatorPerformance.length
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-green-500 rounded-full'
                      style={{
                        width: `${
                          operatorPerformance.length > 0
                            ? Math.round(
                                operatorPerformance.reduce(
                                  (sum, op) => sum + op.efficiency,
                                  0
                                ) / operatorPerformance.length
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='text-gray-600'>
                      Total Revenue Generated
                    </span>
                    <span className='font-medium text-green-600'>
                      $
                      {Math.round(
                        operatorPerformance.reduce(
                          (sum, op) => sum + op.totalRevenueGenerated,
                          0
                        )
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
