import { useState, useEffect } from 'react'
import SummaryCard from './SummaryCard'
import { Link } from 'react-router-dom'
import {
  Clock,
  Car,
  DollarSign,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  ParkingSquare,
  Calendar,
  Receipt,
} from 'lucide-react'
import { ParkingRecord } from '../types/types'
import Button from './Button'
import StatCard from './StatCard'
import ActivityTable from './ActivityTable'
import AreaDetailModal from './AreaDetailModal'

interface OperatorDashboardProps {
  operatorData: {
    areas: any[]
    records: ParkingRecord[]
  }
}

interface AreaStats {
  id: string
  name: string
  location: string
  currentOccupancy: number
  totalSpaces: number
  hourlyRate: number
  todayRevenue: number
  totalRevenue: number
  todayVehicles: number
  totalVehicles: number
  occupancyPercentage: number
  status: 'low' | 'medium' | 'high' | 'full'
}

export default function OperatorDashboard({
  operatorData,
}: OperatorDashboardProps) {
  const [shiftTime, setShiftTime] = useState({
    hours: 4,
    minutes: 22,
    seconds: 15,
  })
  const [searchPlate, setSearchPlate] = useState('')
  const [filteredRecords, setFilteredRecords] = useState<ParkingRecord[]>([])
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState<'today' | 'all'>('all')
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)

  const calculateMetrics = () => {
    const { areas, records } = operatorData
    const today = new Date().toISOString().split('T')[0]

    const todayRecords = records.filter((record) =>
      record.entryTime.includes(today)
    )

    const currentlyParked = records.filter((record) => !record.exitTime)

    const paidRecords = records.filter(
      (record) => record.paymentStatus === 'paid'
    )
    const todayRevenue = todayRecords
      .filter((record) => record.paymentStatus === 'paid')
      .reduce((sum, record) => sum + record.amountPaid, 0)

    const totalRevenue = paidRecords.reduce(
      (sum, record) => sum + record.amountPaid,
      0
    )

    const vehiclesToday = todayRecords.length

    const totalVehicles = records.length

    const areaStats: AreaStats[] = areas.map((area) => {
      const areaRecords = records.filter((r) => r.parkingAreaId === area.id)
      const todayAreaRecords = areaRecords.filter((r) =>
        r.entryTime.includes(today)
      )
      const areaPaidRecords = areaRecords.filter(
        (r) => r.paymentStatus === 'paid'
      )

      const areaTodayRevenue = todayAreaRecords
        .filter((r) => r.paymentStatus === 'paid')
        .reduce((sum, r) => sum + r.amountPaid, 0)

      const areaTotalRevenue = areaPaidRecords.reduce(
        (sum, r) => sum + r.amountPaid,
        0
      )

      const currentlyParkedCount = areaRecords.filter((r) => !r.exitTime).length
      const occupancyPercentage =
        (currentlyParkedCount / area.totalSpaces) * 100

      // Determine status based on occupancy
      let status: AreaStats['status'] = 'low'
      if (occupancyPercentage >= 90) status = 'full'
      else if (occupancyPercentage >= 70) status = 'high'
      else if (occupancyPercentage >= 40) status = 'medium'

      return {
        id: area.id,
        name: area.name,
        location: area.location,
        currentOccupancy: currentlyParkedCount,
        totalSpaces: area.totalSpaces,
        hourlyRate: area.hourlyRate,
        todayRevenue: areaTodayRevenue,
        totalRevenue: areaTotalRevenue,
        todayVehicles: todayAreaRecords.length,
        totalVehicles: areaRecords.length,
        occupancyPercentage,
        status,
      }
    })

    const totalAssignedSpaces = areas.reduce(
      (sum, area) => sum + area.totalSpaces,
      0
    )
    const totalOccupied = currentlyParked.length
    const overallOccupancy =
      totalAssignedSpaces > 0 ? (totalOccupied / totalAssignedSpaces) * 100 : 0

    const paymentStatus = {
      paid: records.filter((r) => r.paymentStatus === 'paid').length,
      pending: records.filter((r) => r.paymentStatus === 'pending').length,
    }

    return {
      totalAssignedSpaces,
      totalOccupied,
      overallOccupancy,
      todayRevenue,
      totalRevenue,
      vehiclesToday,
      totalVehicles,
      currentlyParked,
      paidRecords,
      areaStats,
      todayRecords,
      paymentStatus,
    }
  }

  useEffect(() => {
    const metrics = calculateMetrics()
    let filtered =
      timeFilter === 'today' ? metrics.todayRecords : operatorData.records

    if (selectedArea !== 'all') {
      filtered = filtered.filter(
        (record) => record.parkingAreaId === selectedArea
      )
    }

    if (searchPlate.trim()) {
      filtered = filtered.filter((record) =>
        record.licensePlate.toLowerCase().includes(searchPlate.toLowerCase())
      )
    }

    setFilteredRecords(filtered)
  }, [searchPlate, selectedArea, timeFilter, operatorData])

  useEffect(() => {
    const interval = setInterval(() => {
      setShiftTime((prev) => {
        let { hours, minutes, seconds } = prev
        seconds += 1

        if (seconds === 60) {
          seconds = 0
          minutes += 1
        }

        if (minutes === 60) {
          minutes = 0
          hours += 1
        }

        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const metrics = calculateMetrics()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const getOccupancyColor = (rate: number): 'green' | 'yellow' | 'red' => {
    if (rate < 60) return 'green'
    if (rate < 80) return 'yellow'
    return 'red'
  }

  const handleAreaClick = (areaId: string) => {
    setSelectedAreaId(areaId)
  }

  const handleCloseModal = () => {
    setSelectedAreaId(null)
  }

  return (
    <div className='space-y-6'>
      {selectedAreaId && (
        <AreaDetailModal areaId={selectedAreaId} onClose={handleCloseModal} />
      )}

      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold'>Operator Dashboard</h1>
            <p className='text-blue-100 mt-1'>
              Managing {operatorData.areas.length} parking areas •{' '}
              {metrics.totalVehicles} total vehicles
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <Link
              to='/operator/reports'
              className='flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm'
            >
              View Reports
            </Link>

            <div className='text-right'>
              <p className='text-sm text-blue-200'>Current Shift</p>
              <p className='text-lg font-semibold'>
                {String(shiftTime.hours).padStart(2, '0')}:
                {String(shiftTime.minutes).padStart(2, '0')}:
                {String(shiftTime.seconds).padStart(2, '0')}
              </p>
            </div>
            <Clock className='w-8 h-8 text-blue-200' />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          title='Total Revenue'
          value={`$${metrics.totalRevenue.toFixed(2)}`}
          change={`+$${metrics.todayRevenue.toFixed(2)} today`}
          icon={<DollarSign className='w-6 h-6 text-green-600' />}
          color='green'
          glow
          subtitle={`${metrics.paymentStatus.paid} paid • ${metrics.paymentStatus.pending} pending`}
        />

        <StatCard
          title='Vehicles Processed'
          value={metrics.totalVehicles}
          change={`+${metrics.vehiclesToday} today`}
          icon={<Car className='w-6 h-6 text-blue-600' />}
          color='blue'
          glow
        />

        <StatCard
          title='Current Occupancy'
          value={`${metrics.overallOccupancy.toFixed(1)}%`}
          change={`${metrics.totalOccupied}/${metrics.totalAssignedSpaces} spots`}
          icon={<ParkingSquare className='w-6 h-6 text-purple-600' />}
          color={getOccupancyColor(metrics.overallOccupancy)}
          glow
        />

        <StatCard
          title='Assigned Areas'
          value={operatorData.areas.length}
          change={`${
            metrics.areaStats.filter((a) => a.status === 'full').length
          } at capacity`}
          icon={<MapPin className='w-6 h-6 text-orange-600' />}
          color='purple'
          glow
          subtitle={`${metrics.paymentStatus.paid} paid, ${metrics.paymentStatus.pending} pending`}
        />
      </div>

      <div className='bg-white rounded-2xl shadow-sm border p-6'>
        <div className='flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Assigned Parking Areas Revenue
          </h2>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='py-3 px-4 text-left text-sm font-medium text-gray-700'>
                  Area Name
                </th>
                <th className='py-3 px-4 text-left text-sm font-medium text-gray-700'>
                  Location
                </th>
                <th className='py-3 px-4 text-left text-sm font-medium text-gray-700'>
                  Occupancy
                </th>
                <th className='py-3 px-4 text-left text-sm font-medium text-gray-700'>
                  Rate
                </th>
                <th className='py-3 px-4 text-left text-sm font-medium text-gray-700'>
                  Today's Revenue
                </th>
                <th className='py-3 px-4 text-left text-sm font-medium text-gray-700'>
                  Total Revenue
                </th>
                <th className='py-3 px-4 text-left text-sm font-medium text-gray-700'>
                  Vehicles
                </th>
                <th className='py-3 px-4 text-left text-sm font-medium text-gray-700'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {metrics.areaStats.map((area) => (
                <tr
                  key={area.id}
                  className='hover:bg-gray-50 transition-colors cursor-pointer'
                  onClick={() => handleAreaClick(area.id)}
                >
                  <td className='py-3 px-4'>
                    <div className='font-medium text-gray-900'>{area.name}</div>
                  </td>
                  <td className='py-3 px-4 text-gray-600'>{area.location}</td>
                  <td className='py-3 px-4'>
                    <div className='space-y-1'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-700'>
                          {area.currentOccupancy}/{area.totalSpaces}
                        </span>
                        <span className='font-medium'>
                          {area.occupancyPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                        <div
                          className={`h-full ${
                            area.status === 'full'
                              ? 'bg-red-500'
                              : area.status === 'high'
                              ? 'bg-yellow-500'
                              : area.status === 'medium'
                              ? 'bg-blue-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min(
                              area.occupancyPercentage,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className='py-3 px-4'>
                    <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium'>
                      <DollarSign className='w-3 h-3' />$
                      {area.hourlyRate.toFixed(2)}/hr
                    </span>
                  </td>
                  <td className='py-3 px-4'>
                    <div className='font-medium text-gray-900'>
                      ${area.todayRevenue.toFixed(2)}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {area.todayVehicles} vehicles today
                    </div>
                  </td>
                  <td className='py-3 px-4'>
                    <div className='font-bold text-gray-900'>
                      ${area.totalRevenue.toFixed(2)}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {area.totalVehicles} total vehicles
                    </div>
                  </td>
                  <td className='py-3 px-4'>
                    <div className='space-y-1'>
                      <div className='text-sm text-gray-700'>
                        Today: {area.todayVehicles}
                      </div>
                      <div className='text-sm text-gray-500'>
                        Total: {area.totalVehicles}
                      </div>
                    </div>
                  </td>
                  <td className='py-3 px-4'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        area.status === 'full'
                          ? 'bg-red-100 text-red-700'
                          : area.status === 'high'
                          ? 'bg-yellow-100 text-yellow-700'
                          : area.status === 'medium'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {area.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className='bg-gray-50'>
              <tr>
                <td
                  colSpan={4}
                  className='py-3 px-4 text-right font-medium text-gray-700'
                >
                  Total:
                </td>
                <td className='py-3 px-4 font-bold text-gray-900'>
                  ${metrics.todayRevenue.toFixed(2)}
                </td>
                <td className='py-3 px-4 font-bold text-gray-900'>
                  ${metrics.totalRevenue.toFixed(2)}
                </td>
                <td className='py-3 px-4 font-medium text-gray-700'>
                  Today: {metrics.vehiclesToday}
                  <br />
                  Total: {metrics.totalVehicles}
                </td>
                <td className='py-3 px-4'></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className='bg-white rounded-2xl shadow-sm border p-6'>
        <div className='flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Parking Records ({filteredRecords.length})
          </h2>

          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex items-center gap-2'>
              <Calendar className='w-4 h-4 text-gray-500' />
              <select
                value={timeFilter}
                onChange={(e) =>
                  setTimeFilter(e.target.value as 'today' | 'all')
                }
                className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='today'>Today Only</option>
                <option value='all'>All Records</option>
              </select>
            </div>

            <div className='flex items-center gap-2'>
              <Filter className='w-4 h-4 text-gray-500' />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='all'>All Areas</option>
                {operatorData.areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSearch} className='flex gap-2'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='text'
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value)}
                  placeholder='Search by license plate...'
                  className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64'
                />
              </div>
              <Button
                title='Search'
                btnType='submit'
                btnStyle='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
              />
            </form>
          </div>
        </div>
        <ActivityTable
          records={filteredRecords}
          areas={operatorData.areas}
          emptyMessage={
            searchPlate || selectedArea !== 'all' || timeFilter !== 'all'
              ? 'No records match your search criteria'
              : 'No parking records found for your assigned areas'
          }
        />
        <div className='mt-6 pt-6 border-t border-gray-200'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <SummaryCard
              title='Paid Records'
              value={metrics.paymentStatus.paid}
              icon={CheckCircle2}
              iconColor='text-green-600'
              bgColor='bg-green-50'
              borderColor='border-green-100'
            />

            <SummaryCard
              title='Pending Records'
              value={metrics.paymentStatus.pending}
              icon={AlertCircle}
              iconColor='text-yellow-600'
              bgColor='bg-yellow-50'
              borderColor='border-yellow-100'
            />

            <SummaryCard
              title='Currently Parked'
              value={metrics.currentlyParked.length}
              icon={Receipt}
              iconColor='text-blue-600'
              bgColor='bg-blue-50'
              borderColor='border-blue-100'
            />
          </div>
        </div>
      </div>
    </div>
  )
}
