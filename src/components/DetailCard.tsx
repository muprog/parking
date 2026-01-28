import { ReactNode } from 'react'

interface DetailCardProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export default function DetailCard({
  title,
  icon,
  children,
  className = '',
}: DetailCardProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className='font-medium text-gray-900 flex items-center gap-2'>
        {icon}
        {title}
      </h4>
      <div className='space-y-3'>{children}</div>
    </div>
  )
}
