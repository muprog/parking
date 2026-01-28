interface ShiftData {
  shift: string
  efficiency: number
  operatorCount: number
  isCurrent?: boolean
}

interface ShiftComparisonProps {
  shifts: ShiftData[]
  currentShiftEfficiency: number
}

export default function ShiftComparison({
  shifts,
  currentShiftEfficiency,
}: ShiftComparisonProps) {
  return (
    <div className='space-y-6'>
      <div>
        <div className='flex justify-between mb-2'>
          <span className='text-sm text-gray-600'>Shift Efficiency</span>
          <span className='text-sm font-medium'>{currentShiftEfficiency}%</span>
        </div>
        <div className='h-3 bg-gray-200 rounded-full overflow-hidden'>
          <div
            className='h-full bg-blue-500 rounded-full'
            style={{
              width: `${currentShiftEfficiency}%`,
            }}
          />
        </div>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        {shifts.map((shift) => (
          <div
            key={shift.shift}
            className={`rounded-lg p-4 text-center ${
              shift.isCurrent
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-gray-50'
            }`}
          >
            <div className='text-sm font-medium text-gray-900 capitalize mb-1'>
              {shift.shift} Shift
            </div>
            <div
              className={`text-xl font-bold ${
                shift.isCurrent ? 'text-blue-700' : 'text-gray-700'
              }`}
            >
              {shift.efficiency}%
            </div>
            <div className='text-xs text-gray-500 mt-1'>
              {shift.operatorCount} operators
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
