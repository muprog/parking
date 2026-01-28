import { useState, useEffect } from 'react'
import { PARKING_AREAS, PARKING_RECORDS, DAILY_REPORTS } from '../data/data'
import { ParkingArea } from '../types/types'
import Button from './Button'

interface AreaDetailModalProps {
  areaId: string | null
  onClose: () => void
}

interface VehicleInArea {
  licensePlate: string
  entryTime: string
  duration: string
  paymentStatus: 'paid' | 'pending'
  spotNumber: number
  vehicleType: string
  amountPaid?: number
}

interface DailyRevenue {
  date: string
  revenue: number
}

export default function AreaDetailModal({
  areaId,
  onClose,
}: AreaDetailModalProps) {
  const [area, setArea] = useState<ParkingArea | null>(null)
  const [vehicles, setVehicles] = useState<VehicleInArea[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleInArea[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null)
  const [dailyRevenues, setDailyRevenues] = useState<DailyRevenue[]>([])

  const [parkingSpots, setParkingSpots] = useState<
    Array<{
      spotNumber: number
      status: 'empty' | 'occupied'
      vehicleDetails?: {
        licensePlate: string
        vehicleType: string
        entryTime: string
      }
    }>
  >([])

  useEffect(() => {
    if (areaId) {
      const foundArea = PARKING_AREAS.find((a) => a.id === areaId)
      setArea(foundArea || null)

      const areaRecords = PARKING_RECORDS.filter(
        (record) => record.parkingAreaId === areaId && !record.exitTime
      )

      const vehicleList: VehicleInArea[] = areaRecords.map((record, index) => {
        const entryTime = new Date(record.entryTime)
        const now = new Date()
        const diffHours = Math.floor(
          (now.getTime() - entryTime.getTime()) / (1000 * 60 * 60)
        )
        const diffMinutes = Math.floor(
          (now.getTime() - entryTime.getTime()) / (1000 * 60)
        )

        let duration = ''
        if (diffHours > 0) {
          duration = `${diffHours}h`
        } else if (diffMinutes > 0) {
          duration = `${diffMinutes}m`
        } else {
          duration = 'Just arrived'
        }

        return {
          licensePlate: record.licensePlate,
          entryTime: entryTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          duration,
          paymentStatus: record.paymentStatus,
          spotNumber: index + 1,
          vehicleType: record.vehicleType,
          amountPaid: record.amountPaid || 0,
        }
      })

      setVehicles(vehicleList)
      setFilteredVehicles(vehicleList)

      const totalSpaces = foundArea?.totalSpaces || 0
      const spots = Array.from({ length: totalSpaces }, (_, i) => {
        const spotNumber = i + 1
        const vehicle = vehicleList.find((v) => v.spotNumber === spotNumber)

        if (vehicle) {
          return {
            spotNumber,
            status: 'occupied' as const,
            vehicleDetails: {
              licensePlate: vehicle.licensePlate,
              vehicleType: vehicle.vehicleType,
              entryTime: vehicle.entryTime,
            },
          }
        } else {
          return {
            spotNumber,
            status: 'empty' as const,
          }
        }
      })

      setParkingSpots(spots)

      const areaDailyReports = DAILY_REPORTS.filter(
        (report) => report.parkingAreaId === areaId
      ).slice(0, 7)
      const revenueData: DailyRevenue[] = areaDailyReports.map((report) => ({
        date: new Date(report.date).toLocaleDateString('en-US', {
          weekday: 'short',
        }),
        revenue: report.totalRevenue,
      }))

      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const completeRevenueData = daysOfWeek.map((day) => {
        const existing = revenueData.find((r) => r.date === day)
        return existing || { date: day, revenue: 0 }
      })

      setDailyRevenues(completeRevenueData)
    }
  }, [areaId])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredVehicles(vehicles)
    } else {
      const filtered = vehicles.filter(
        (vehicle) =>
          vehicle.licensePlate
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          vehicle.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredVehicles(filtered)
    }
  }, [searchTerm, vehicles])

  const handleSpotClick = (spotNumber: number) => {
    setSelectedSpot(spotNumber)
    console.log(`Clicked spot ${spotNumber}`)

    const spot = parkingSpots.find((s) => s.spotNumber === spotNumber)
    if (spot?.status === 'occupied' && spot.vehicleDetails) {
      console.log(`Vehicle: ${spot.vehicleDetails.licensePlate}`)
    }
  }

  const getStatusColor = (status: 'empty' | 'occupied') => {
    return status === 'occupied'
      ? 'bg-red-100 border-red-300 hover:bg-red-50'
      : 'bg-green-100 border-green-300 hover:bg-green-50'
  }

  const getStatusLabel = (status: 'empty' | 'occupied') => {
    return status === 'occupied' ? 'Occupied' : 'Available'
  }

  const calculateTotalRevenue = () => {
    const areaRecords = PARKING_RECORDS.filter(
      (record) => record.parkingAreaId === areaId && record.amountPaid > 0
    )
    return areaRecords.reduce((sum, record) => sum + record.amountPaid, 0)
  }

  if (!area || !areaId) return null

  const occupancyPercentage = (area.currentOccupancy / area.totalSpaces) * 100
  const totalRevenue = calculateTotalRevenue()

  const averageHoursParked = 4
  const currentRevenue =
    area.currentOccupancy * area.hourlyRate * averageHoursParked

  const getOccupancyColor = (rate: number): string => {
    if (rate < 75) return 'text-green-600 bg-green-50 border-green-100'
    if (rate < 90) return 'text-yellow-600 bg-yellow-50 border-yellow-100'
    return 'text-red-600 bg-red-50 border-red-100'
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const MetricBox = ({
    title,
    value,
    subtitle,
    color = 'gray',
  }: {
    title: string
    value: string | number
    subtitle?: string
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-100',
      green: 'bg-green-50 border-green-100',
      yellow: 'bg-yellow-50 border-yellow-100',
      red: 'bg-red-50 border-red-100',
      purple: 'bg-purple-50 border-purple-100',
      gray: 'bg-gray-50 border-gray-100',
    }

    return (
      <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
        <div className='text-sm text-gray-600'>{title}</div>
        <div className='text-xl font-bold text-gray-900 mt-1'>{value}</div>
        {subtitle && (
          <div className='text-xs text-gray-500 mt-1'>{subtitle}</div>
        )}
      </div>
    )
  }

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto pt-16'
      onClick={handleBackdropClick}
    >
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-7xl my-4'>
        <div className='bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6 rounded-t-2xl flex justify-between items-center'>
          <div className='text-white'>
            <h2 className='text-2xl font-bold'>{area.name}</h2>
            <p className='text-blue-100 mt-1 flex items-center gap-2'>
              <span>📍</span>
              <span>{area.location}</span>
            </p>
            <div className='flex items-center gap-4 mt-3'>
              <div className='bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full text-sm'>
                {area.currentOccupancy}/{area.totalSpaces} spots occupied
              </div>
              <div className='bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full text-sm'>
                ${area.hourlyRate.toFixed(2)}/hour
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  occupancyPercentage >= 90
                    ? 'bg-red-500 bg-opacity-30'
                    : occupancyPercentage >= 75
                    ? 'bg-yellow-500 bg-opacity-30'
                    : 'bg-green-500 bg-opacity-30'
                }`}
              >
                {occupancyPercentage.toFixed(1)}% occupied
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='flex flex-col'>
          <div className='border-b p-8'>
            <div className='flex justify-between items-center mb-6'>
              <div>
                <h3 className='text-xl font-semibold text-gray-900'>
                  Currently Parked Vehicles
                </h3>
                <p className='text-gray-600 text-sm mt-1'>
                  {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}{' '}
                  currently in the area
                </p>
              </div>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search by license plate or type...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-72'
                />
                <span className='absolute left-3 top-3.5 text-gray-400'>
                  🔍
                </span>
              </div>
            </div>

            {filteredVehicles.length === 0 ? (
              <div className='text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl'>
                <div className='text-4xl mb-3'>🚗</div>
                <p className='text-lg font-medium mb-2'>
                  {searchTerm
                    ? 'No vehicles match your search'
                    : 'No vehicles currently parked'}
                </p>
                <p className='text-sm text-gray-400'>
                  {searchTerm
                    ? 'Try a different search term'
                    : 'All parking spots are available'}
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={`${vehicle.licensePlate}-${vehicle.spotNumber}`}
                    className='border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white'
                  >
                    <div className='flex justify-between items-start mb-4'>
                      <div>
                        <div className='font-bold text-gray-900 text-xl'>
                          {vehicle.licensePlate}
                        </div>
                        <div className='text-sm text-gray-500 mt-1 flex items-center gap-2'>
                          <span className='px-2 py-1 bg-gray-100 rounded text-xs'>
                            {vehicle.vehicleType}
                          </span>
                          <span>•</span>
                          <span>Spot #{vehicle.spotNumber}</span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          vehicle.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {vehicle.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                      </span>
                    </div>

                    <div className='grid grid-cols-2 gap-4 mb-4'>
                      <div className='bg-gray-50 p-3 rounded-lg'>
                        <div className='text-xs text-gray-500'>Entry Time</div>
                        <div className='font-medium text-gray-900'>
                          {vehicle.entryTime}
                        </div>
                      </div>
                      <div className='bg-gray-50 p-3 rounded-lg'>
                        <div className='text-xs text-gray-500'>Duration</div>
                        <div className='font-medium text-gray-900'>
                          {vehicle.duration}
                        </div>
                      </div>
                    </div>

                    {vehicle.amountPaid && vehicle.amountPaid > 0 && (
                      <div className='flex justify-between items-center pt-4 border-t'>
                        <span className='text-sm text-gray-600'>
                          Amount Paid
                        </span>
                        <span className='font-bold text-green-600 text-lg'>
                          ${vehicle.amountPaid.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='border-b p-8 bg-gray-50'>
            <h3 className='text-xl font-semibold text-gray-900 mb-8'>
              Area Statistics & Analytics
            </h3>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              <div className='lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
                <h4 className='font-semibold text-gray-900 mb-6 text-lg'>
                  Revenue Overview
                </h4>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                  <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border border-green-100'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <div className='text-sm text-gray-600'>
                          Estimated Current Revenue
                        </div>
                        <div className='font-bold text-green-700 text-2xl mt-1'>
                          ${currentRevenue.toFixed(2)}
                        </div>
                      </div>
                      <div className='text-3xl'>💰</div>
                    </div>
                    <div className='text-xs text-gray-500 mt-2'>
                      Based on {area.currentOccupancy} vehicles × $
                      {area.hourlyRate}/hour × 4 hours avg
                    </div>
                  </div>

                  <div className='bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-lg border border-blue-100'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <div className='text-sm text-gray-600'>
                          Total Historical Revenue
                        </div>
                        <div className='font-bold text-blue-700 text-2xl mt-1'>
                          ${totalRevenue.toFixed(2)}
                        </div>
                      </div>
                      <div className='text-3xl'>📊</div>
                    </div>
                    <div className='text-xs text-gray-500 mt-2'>
                      From all completed parking sessions in this area
                    </div>
                  </div>
                </div>

                <div>
                  <div className='flex justify-between items-center mb-4'>
                    <h5 className='font-semibold text-gray-900'>
                      Daily Revenue Trend
                    </h5>
                  </div>
                  <div className='flex items-end h-40 gap-3'>
                    {dailyRevenues.map((dayData) => {
                      const maxRevenue = Math.max(
                        ...dailyRevenues.map((d) => d.revenue)
                      )
                      const height =
                        maxRevenue > 0
                          ? (dayData.revenue / maxRevenue) * 100
                          : 0
                      const isToday =
                        dayData.date ===
                        new Date().toLocaleDateString('en-US', {
                          weekday: 'short',
                        })
                      return (
                        <div
                          key={dayData.date}
                          className='flex-1 flex flex-col items-center'
                        >
                          <div
                            className={`w-10 rounded-t-lg transition-all duration-300 ${
                              isToday ? 'bg-blue-600' : 'bg-blue-400'
                            }`}
                            style={{ height: `${height}%` }}
                          />
                          <div className='text-xs text-gray-600 mt-3 font-medium'>
                            {dayData.date}
                          </div>
                          <div className='text-xs font-bold mt-1'>
                            $
                            {dayData.revenue > 0
                              ? dayData.revenue.toFixed(2)
                              : '0'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className='space-y-6'>
                <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
                  <h4 className='font-semibold text-gray-900 mb-4'>
                    Area Information
                  </h4>
                  <div className='grid grid-cols-2 gap-4'>
                    <MetricBox
                      title='Hourly Rate'
                      value={`$${area.hourlyRate.toFixed(2)}`}
                      color='blue'
                    />
                    <MetricBox
                      title='Daily Rate'
                      value={`$${(area.hourlyRate * 24).toFixed(2)}`}
                      color='green'
                    />
                    <MetricBox
                      title='Capacity'
                      value={area.totalSpaces.toString()}
                      color='purple'
                    />
                    <div
                      className={`p-4 rounded-lg border ${getOccupancyColor(
                        occupancyPercentage
                      )}`}
                    >
                      <div className='text-sm text-gray-600'>Occupancy</div>
                      <div className='text-xl font-bold text-gray-900 mt-1'>
                        {occupancyPercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
                  <h4 className='font-semibold text-gray-900 mb-4'>
                    Spot Status Legend
                  </h4>
                  <div className='space-y-3'>
                    <div className='flex items-center p-3 bg-green-50 rounded-lg border border-green-200'>
                      <div className='w-5 h-5 bg-green-500 rounded mr-3'></div>
                      <div>
                        <span className='font-medium text-gray-800'>
                          Available
                        </span>
                        <div className='text-xs text-gray-600 mt-1'>
                          Spot is empty and ready for parking
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center p-3 bg-red-50 rounded-lg border border-red-200'>
                      <div className='w-5 h-5 bg-red-500 rounded mr-3'></div>
                      <div>
                        <span className='font-medium text-gray-800'>
                          Occupied
                        </span>
                        <div className='text-xs text-gray-600 mt-1'>
                          Vehicle is currently parked
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedSpot && (
                  <div className='bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200'>
                    <h4 className='font-semibold text-gray-900 mb-3'>
                      Selected Spot
                    </h4>
                    <div className='flex items-center justify-between mb-3'>
                      <div className='text-3xl font-bold text-blue-700'>
                        #{selectedSpot}
                      </div>
                      <div
                        className={`px-4 py-2 rounded-lg font-medium ${
                          parkingSpots.find(
                            (s) => s.spotNumber === selectedSpot
                          )?.status === 'occupied'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {getStatusLabel(
                          parkingSpots.find(
                            (s) => s.spotNumber === selectedSpot
                          )?.status || 'empty'
                        )}
                      </div>
                    </div>
                    {parkingSpots.find((s) => s.spotNumber === selectedSpot)
                      ?.vehicleDetails && (
                      <div className='mt-4 pt-4 border-t border-blue-200'>
                        <div className='text-sm text-gray-600'>
                          Vehicle Details
                        </div>
                        <div className='font-mono text-gray-800 mt-1'>
                          {
                            parkingSpots.find(
                              (s) => s.spotNumber === selectedSpot
                            )?.vehicleDetails?.licensePlate
                          }
                        </div>
                        <div className='mt-3'>
                          <Button
                            title='View Details'
                            btnStyle='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                            fullWidth
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='p-8'>
            <div className='flex justify-between items-center mb-8'>
              <div>
                <h3 className='text-xl font-semibold text-gray-900'>
                  Parking Spot Grid
                </h3>
                <p className='text-gray-600 text-sm mt-1'>
                  Click on any spot to select it
                </p>
              </div>
              <div className='flex items-center gap-4'>
                <div className='text-sm text-gray-600'>
                  <span className='font-bold text-gray-900'>
                    {area.currentOccupancy}
                  </span>{' '}
                  of{' '}
                  <span className='font-bold text-gray-900'>
                    {area.totalSpaces}
                  </span>{' '}
                  spots occupied
                </div>
                <div
                  className={`px-4 py-2 rounded-lg font-medium ${getOccupancyColor(
                    occupancyPercentage
                  )}`}
                >
                  {occupancyPercentage.toFixed(1)}% occupancy
                </div>
              </div>
            </div>

            <div className='grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4'>
              {parkingSpots.map((spot) => (
                <div
                  key={spot.spotNumber}
                  className={`relative h-24 rounded-xl border-2 ${getStatusColor(
                    spot.status
                  )} 
                    flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200
                    ${
                      selectedSpot === spot.spotNumber
                        ? 'ring-4 ring-blue-500 ring-offset-2 shadow-lg'
                        : ''
                    }`}
                  onClick={() => handleSpotClick(spot.spotNumber)}
                >
                  <div className='text-center'>
                    <div className='font-extrabold text-gray-800 text-lg'>
                      #{spot.spotNumber}
                    </div>
                    <div
                      className={`text-xs font-medium mt-2 px-2 py-1 rounded-full ${
                        spot.status === 'occupied'
                          ? 'bg-red-200 text-red-800'
                          : 'bg-green-200 text-green-800'
                      }`}
                    >
                      {getStatusLabel(spot.status)}
                    </div>
                    {spot.vehicleDetails && (
                      <div className='text-xs text-gray-600 mt-2 truncate px-1 font-mono'>
                        {spot.vehicleDetails.licensePlate}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
