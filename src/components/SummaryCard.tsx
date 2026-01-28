import { LucideIcon } from 'lucide-react'

interface SummaryCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  bgColor?: string
  borderColor?: string
}

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor = 'bg-white',
  borderColor = 'border-gray-200',
}: SummaryCardProps) {
  return (
    <div className={`rounded-xl border ${borderColor} p-4 ${bgColor}`}>
      <div className='flex items-center gap-3'>
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <div>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='mt-2 text-3xl font-bold text-gray-800'>{value}</p>
        </div>
      </div>
    </div>
  )
}
