import { ParkingRecord } from '../types/types'
import { ParkingArea } from '../types/types'

interface ActivityTableProps {
  records: ParkingRecord[]
  areas: ParkingArea[]
  emptyMessage?: string
}

export default function ActivityTable({
  records,
  areas,
  emptyMessage = 'No activity records found.',
}: ActivityTableProps) {
  const getAreaName = (areaId: string) => {
    const area = areas.find((a) => a.id === areaId)
    return area?.name || 'Unknown Area'
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-6 py-3 text-left text-gray-600'>License Plate</th>
            <th className='px-6 py-3 text-left text-gray-600'>Area</th>
            <th className='px-6 py-3 text-left text-gray-600'>Entry Time</th>
            <th className='px-6 py-3 text-left text-gray-600'>Exit Time</th>
            <th className='px-6 py-3 text-left text-gray-600'>Amount</th>
            <th className='px-6 py-3 text-left text-gray-600'>Status</th>
          </tr>
        </thead>

        <tbody className='divide-y'>
          {records.map((record) => (
            <tr key={record.id} className='hover:bg-gray-50'>
              <td className='px-6 py-4 font-medium'>{record.licensePlate}</td>
              <td className='px-6 py-4'>
                <div className='font-medium'>
                  {getAreaName(record.parkingAreaId)}
                </div>
                <div className='text-xs text-gray-500'>
                  {record.vehicleType}
                </div>
              </td>
              <td className='px-6 py-4'>
                {new Date(record.entryTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className='px-6 py-4'>
                {record.exitTime
                  ? new Date(record.exitTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Active'}
              </td>
              <td className='px-6 py-4'>
                {record.amountPaid > 0
                  ? `$${record.amountPaid.toFixed(2)}`
                  : '-'}
              </td>
              <td className='px-6 py-4'>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    record.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {record.paymentStatus}
                </span>
              </td>
            </tr>
          ))}

          {records.length === 0 && (
            <tr>
              <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
