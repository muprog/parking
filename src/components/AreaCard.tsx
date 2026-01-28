import { ParkingArea } from '../types/types'

interface AreaCardProps {
  area: ParkingArea
  showLocation?: boolean
}

export default function AreaCard({ area, showLocation = true }: AreaCardProps) {
  const occupancyPercent = (area.currentOccupancy / area.totalSpaces) * 100

  return (
    <div className='border rounded-lg p-3 hover:bg-gray-50 transition-colors'>
      <div className='flex justify-between items-start mb-2'>
        <h4 className='font-medium text-gray-900'>{area.name}</h4>
        {showLocation && (
          <span className='text-xs text-gray-500'>{area.location}</span>
        )}
      </div>

      <div className='flex justify-between text-sm mb-1'>
        <span className='text-gray-600'>
          {area.currentOccupancy}/{area.totalSpaces} spaces
        </span>
        <span className='font-medium'>{occupancyPercent.toFixed(0)}%</span>
      </div>

      <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
        <div
          className={`h-full rounded-full ${
            occupancyPercent >= 80
              ? 'bg-red-500'
              : occupancyPercent >= 50
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${occupancyPercent}%` }}
        />
      </div>

      <div className='flex justify-between mt-2 text-sm'>
        <span className='text-gray-600'>Rate: ${area.hourlyRate}/hr</span>
        <span
          className={`px-2 py-0.5 rounded text-xs ${
            area.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {area.status}
        </span>
      </div>
    </div>
  )
}
