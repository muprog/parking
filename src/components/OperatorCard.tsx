interface OperatorCardProps {
  operator: {
    id: string
    name: string
    assignedAreasCount: number
    totalVehiclesManaged: number
    totalRevenueGenerated: number
    efficiency: number
    shift: 'morning' | 'afternoon' | 'night'
  }
}

export default function OperatorCard({ operator }: OperatorCardProps) {
  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'morning':
        return 'bg-blue-100 text-blue-700'
      case 'afternoon':
        return 'bg-yellow-100 text-yellow-700'
      case 'night':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600'
    if (efficiency >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className='bg-white rounded-xl border p-4 hover:shadow-md transition-shadow'>
      <div className='flex justify-between items-start mb-3'>
        <div>
          <h3 className='font-semibold text-gray-900'>{operator.name}</h3>
          <div className='flex items-center gap-2 mt-1'>
            <span
              className={`text-xs px-2 py-1 rounded-full ${getShiftColor(
                operator.shift
              )}`}
            >
              {operator.shift.charAt(0).toUpperCase() + operator.shift.slice(1)}{' '}
              Shift
            </span>
            <span className='text-xs text-gray-500'>
              {operator.assignedAreasCount} area
              {operator.assignedAreasCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className='text-right'>
          <div
            className={`text-lg font-semibold ${getEfficiencyColor(
              operator.efficiency
            )}`}
          >
            {operator.efficiency}%
          </div>
          <div className='text-xs text-gray-500'>Efficiency</div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3 text-sm'>
        <div className='space-y-1'>
          <div className='text-gray-500'>Vehicles Managed</div>
          <div className='font-medium text-gray-900'>
            {operator.totalVehiclesManaged}
          </div>
        </div>
        <div className='space-y-1'>
          <div className='text-gray-500'>Revenue Generated</div>
          <div className='font-medium text-green-600'>
            ${operator.totalRevenueGenerated.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
