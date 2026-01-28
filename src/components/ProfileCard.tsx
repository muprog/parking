import { Mail, Phone, Clock, CalendarDays } from 'lucide-react'

interface ProfileCardProps {
  name: string
  role: string
  email: string
  phone?: string
  shift: string
  shiftHours: string
  initials: string
}

export default function ProfileCard({
  name,
  role,
  email,
  phone,
  shift,
  shiftHours,
  initials,
}: ProfileCardProps) {
  return (
    <div className='bg-white rounded-2xl shadow-sm border p-6'>
      <div className='flex flex-col items-center text-center'>
        <div className='w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
          <span className='text-3xl font-bold text-blue-600'>{initials}</span>
        </div>

        <h2 className='text-xl font-bold text-gray-900 mb-1'>{name}</h2>
        <span className='inline-block bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full mb-4'>
          {role}
        </span>

        <div className='w-full space-y-3'>
          <div className='flex items-center gap-3 text-gray-600'>
            <Mail className='h-4 w-4' />
            <span className='text-sm'>{email}</span>
          </div>

          {phone && (
            <div className='flex items-center gap-3 text-gray-600'>
              <Phone className='h-4 w-4' />
              <span className='text-sm'>{phone}</span>
            </div>
          )}

          <div className='flex items-center gap-3 text-gray-600'>
            <Clock className='h-4 w-4' />
            <span className='text-sm capitalize'>{shift} Shift</span>
          </div>

          <div className='flex items-center gap-3 text-gray-600'>
            <CalendarDays className='h-4 w-4' />
            <span className='text-sm'>{shiftHours}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
