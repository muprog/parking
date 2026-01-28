import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  glow?: boolean
  subtitle?: string
}

export default function StatCard({
  title,
  value,
  change,
  icon,
  color = 'blue',
  glow = false,
}: StatCardProps) {
  const colorClasses = {
    blue: 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100',
    green: 'border-green-200 bg-gradient-to-br from-green-50 to-green-100',
    yellow: 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100',
    red: 'border-red-200 bg-gradient-to-br from-red-50 to-red-100',
    purple: 'border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100',
  }

  const glowClasses = {
    blue: 'shadow-lg shadow-blue-200/50',
    green: 'shadow-lg shadow-green-200/50',
    yellow: 'shadow-lg shadow-yellow-200/50',
    red: 'shadow-lg shadow-red-200/50',
    purple: 'shadow-lg shadow-purple-200/50',
  }

  return (
    <div
      className={`rounded-xl border p-6 ${colorClasses[color]} ${
        glow ? glowClasses[color] : ''
      }`}
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='mt-2 text-3xl font-bold text-gray-800'>{value}</p>
          {change && (
            <p
              className={`mt-1 text-sm ${
                change.startsWith('+')
                  ? 'text-green-600'
                  : change.startsWith('-')
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {change}
            </p>
          )}
        </div>
        {icon && <div className='text-2xl'>{icon}</div>}
      </div>
    </div>
  )
}
