import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import autoTable from 'jspdf-autotable'

import {
  PARKING_AREAS,
  PARKING_RECORDS,
  DAILY_REPORTS,
  MONTHLY_REPORTS,
} from '../data/data'
import {
  SearchFilters,
  ParkingRecord,
  DailyReport,
  MonthlyReport,
} from '../types/types'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import Button from '../components/Button'
import StatCard from '../components/StatCard'

export default function ReportsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<SearchFilters>({})
  const [filteredRecords, setFilteredRecords] = useState<ParkingRecord[]>([])
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([])
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily')
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 10

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    console.log('=== REPORTS PAGE DEBUG ===')
    console.log('User:', user.email, 'Role:', user.role)
    console.log('Assigned areas:', user.assignedParkingAreas)
    console.log('Total PARKING_RECORDS:', PARKING_RECORDS.length)
    console.log('Total DAILY_REPORTS:', DAILY_REPORTS.length)
    console.log('Total MONTHLY_REPORTS:', MONTHLY_REPORTS.length)

    if (user.role === 'operator') {
      const assignedAreas = user.assignedParkingAreas || []
      console.log('Operator assigned areas:', assignedAreas)

      const allAreaIds = PARKING_RECORDS.map((r) => r.parkingAreaId).filter(
        (value, index, self) => self.indexOf(value) === index
      )
      console.log('All area IDs in PARKING_RECORDS:', allAreaIds)

      const allDailyAreaIds = DAILY_REPORTS.map((r) => r.parkingAreaId).filter(
        (value, index, self) => self.indexOf(value) === index
      )
      console.log('All area IDs in DAILY_REPORTS:', allDailyAreaIds)

      const areaRecords = PARKING_RECORDS.filter((record) => {
        const isInAssignedArea = assignedAreas.includes(record.parkingAreaId)
        console.log(
          `Record ${record.id}: area=${record.parkingAreaId}, assigned=${isInAssignedArea}`
        )
        return isInAssignedArea
      })

      const filteredDaily = DAILY_REPORTS.filter((report) => {
        const isInAssignedArea = assignedAreas.includes(report.parkingAreaId)
        console.log(
          `Daily Report ${report.id}: area=${report.parkingAreaId}, assigned=${isInAssignedArea}`
        )
        return isInAssignedArea
      })

      const filteredMonthly = MONTHLY_REPORTS.filter((report) => {
        const isInAssignedArea = assignedAreas.includes(report.parkingAreaId)
        console.log(
          `Monthly Report ${report.id}: area=${report.parkingAreaId}, assigned=${isInAssignedArea}`
        )
        return isInAssignedArea
      })

      console.log('Filtered areaRecords:', areaRecords)
      console.log('Filtered dailyReports:', filteredDaily)
      console.log('Filtered monthlyReports:', filteredMonthly)

      setFilteredRecords(areaRecords)
      setDailyReports(filteredDaily)
      setMonthlyReports(filteredMonthly)
    } else {
      console.log('Admin - showing all data')
      setFilteredRecords(PARKING_RECORDS)
      setDailyReports(DAILY_REPORTS)
      setMonthlyReports(MONTHLY_REPORTS)
    }

    console.log('=== END DEBUG ===')
  }, [user, navigate])

  const handleSearch = () => {
    console.log('Search triggered with filters:', filters)

    let results = []

    if (user?.role === 'operator') {
      const assignedAreas = user.assignedParkingAreas || []
      results = PARKING_RECORDS.filter((record) =>
        assignedAreas.includes(record.parkingAreaId)
      )
      console.log('Operator search base results:', results.length)
    } else {
      results = [...PARKING_RECORDS]
      console.log('Admin search base results:', results.length)
    }

    if (filters.licensePlate) {
      results = results.filter((record) =>
        record.licensePlate
          .toLowerCase()
          .includes(filters.licensePlate!.toLowerCase())
      )
      console.log('After license plate filter:', results.length)
    }

    if (filters.startDate) {
      results = results.filter(
        (record) => new Date(record.entryTime) >= new Date(filters.startDate!)
      )
      console.log('After start date filter:', results.length)
    }

    if (filters.endDate) {
      results = results.filter(
        (record) => new Date(record.entryTime) <= new Date(filters.endDate!)
      )
      console.log('After end date filter:', results.length)
    }

    if (filters.parkingAreaId && filters.parkingAreaId !== 'all') {
      results = results.filter(
        (record) => record.parkingAreaId === filters.parkingAreaId
      )
      console.log('After area filter:', results.length)
    }

    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      results = results.filter(
        (record) => record.paymentStatus === filters.paymentStatus
      )
      console.log('After payment status filter:', results.length)
    }

    console.log('Final search results:', results)
    setFilteredRecords(results)
    setCurrentPage(1)
  }

  const handleExport = (format: 'csv' | 'pdf' | 'labels') => {
    if (format === 'csv') {
      exportToCSV()
    } else if (format === 'pdf') {
      exportToPDF()
    } else {
      alert('Print labels functionality would be implemented here')
    }
  }

  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      alert('No records to export')
      return
    }
    const formatExcelDate = (date: Date) => {
      const isoString = date.toISOString()
      return isoString.replace('Z', '').split('.')[0]
    }

    const headers = [
      'License Plate',
      'Zone',
      'Vehicle Type',
      'Check-in',
      'Check-out',
      'Duration (hours)',
      'Amount ($)',
      'Payment Status',
      'Status',
    ]

    const rows = filteredRecords.map((record) => {
      const entryDate = new Date(record.entryTime)
      const exitDate = record.exitTime ? new Date(record.exitTime) : null

      const escape = (value: any) => {
        if (value === null || value === undefined) return ''
        const str = String(value)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      return [
        record.licensePlate,
        getAreaName(record.parkingAreaId),
        record.vehicleType,
        formatExcelDate(entryDate),
        exitDate ? formatExcelDate(exitDate) : 'Active',
        record.durationHours.toFixed(2),
        record.amountPaid.toFixed(2),
        record.paymentStatus,
        record.exitTime ? 'Completed' : 'Active',
      ]
        .map(escape)
        .join(',')
    })
    const BOM = '\uFEFF'
    const csvContent = BOM + headers.join(',') + '\n' + rows.join('\n')

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8',
    })

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `Parking_Report_${timestamp}.csv`

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }
  const exportToPDF = () => {
    if (filteredRecords.length === 0) {
      alert('No records to export')
      return
    }

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Parking Management Report', 14, 22)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 32)
    doc.text(`Total Records: ${filteredRecords.length}`, 14, 38)
    doc.text(
      `Total Revenue: $${filteredRecords
        .reduce((sum, r) => sum + r.amountPaid, 0)
        .toFixed(2)}`,
      14,
      44
    )

    const tableData = filteredRecords.map((record) => {
      const entryDate = new Date(record.entryTime)
      const exitDate = record.exitTime ? new Date(record.exitTime) : null

      return [
        record.licensePlate,
        getAreaName(record.parkingAreaId),
        record.vehicleType,
        entryDate.toLocaleDateString() +
          ' ' +
          entryDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
        exitDate
          ? exitDate.toLocaleDateString() +
            ' ' +
            exitDate.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : 'Active',
        record.durationHours.toFixed(2) + 'h',
        '$' + record.amountPaid.toFixed(2),
        record.paymentStatus.charAt(0).toUpperCase() +
          record.paymentStatus.slice(1),
      ]
    })

    autoTable(doc, {
      head: [
        [
          'License Plate',
          'Zone',
          'Type',
          'Check-in',
          'Check-out',
          'Duration',
          'Amount',
          'Status',
        ],
      ],
      body: tableData,
      startY: 50,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'wrap',
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 25 },
        2: { cellWidth: 15 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 18 },
        6: { cellWidth: 18 },
        7: { cellWidth: 18 },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: function (data: any) {
        const pageCount = doc.internal.pages.length - 1
        doc.setFontSize(8)
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        )
      },
    })

    doc.save(`parking_report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const prepareRevenueData = () => {
    console.log('prepareRevenueData called')
    console.log('viewMode:', viewMode)
    console.log('dailyReports:', dailyReports)
    console.log('monthlyReports:', monthlyReports)

    if (viewMode === 'daily') {
      if (dailyReports.length === 0) {
        console.log('No daily reports, returning empty data')
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (6 - i))
          return {
            date: date.toISOString().split('T')[0],
            revenue: 0,
            vehicles: 0,
          }
        })
      }

      const grouped = dailyReports.reduce((acc, report) => {
        if (!acc[report.date]) {
          acc[report.date] = { revenue: 0, vehicles: 0 }
        }
        acc[report.date].revenue += report.totalRevenue
        acc[report.date].vehicles += report.totalVehicles
        return acc
      }, {} as Record<string, { revenue: number; vehicles: number }>)

      const result = Object.entries(grouped)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-10)

      console.log('Daily revenue data result:', result)
      return result
    } else {
      if (monthlyReports.length === 0) {
        console.log('No monthly reports, returning empty data')
        const currentMonth = new Date().toISOString().slice(0, 7)
        const lastMonth = new Date()
        lastMonth.setMonth(lastMonth.getMonth() - 1)
        const lastMonthStr = lastMonth.toISOString().slice(0, 7)

        return [
          { month: lastMonthStr, revenue: 0, vehicles: 0 },
          { month: currentMonth, revenue: 0, vehicles: 0 },
        ]
      }

      const grouped = monthlyReports.reduce((acc, report) => {
        if (!acc[report.month]) {
          acc[report.month] = { revenue: 0, vehicles: 0 }
        }
        acc[report.month].revenue += report.totalRevenue
        acc[report.month].vehicles += report.totalVehicles
        return acc
      }, {} as Record<string, { revenue: number; vehicles: number }>)

      const result = Object.entries(grouped)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month))

      console.log('Monthly revenue data result:', result)
      return result
    }
  }

  const prepareVehiclesPerArea = () => {
    console.log('prepareVehiclesPerArea called')
    console.log('filteredRecords:', filteredRecords)
    console.log('User role:', user?.role)

    let areasToShow = PARKING_AREAS

    if (user?.role === 'operator') {
      const assignedAreas = user.assignedParkingAreas || []
      console.log('Operator assigned areas for filtering:', assignedAreas)
      areasToShow = PARKING_AREAS.filter((area) =>
        assignedAreas.includes(area.id)
      )
      console.log(
        'Areas to show for operator:',
        areasToShow.map((a) => a.name)
      )
    }

    const areaData = areasToShow.map((area) => {
      const areaRecords = filteredRecords.filter(
        (record) => record.parkingAreaId === area.id
      )
      const revenue = areaRecords.reduce((sum, r) => sum + r.amountPaid, 0)
      const vehicles = areaRecords.length

      console.log(
        `Area ${area.name} (${area.id}): vehicles=${vehicles}, revenue=${revenue}`
      )

      return {
        name: area.name,
        vehicles,
        revenue,
      }
    })

    const sortedData = areaData.sort((a, b) => b.vehicles - a.vehicles)
    console.log('Sorted area data:', sortedData)
    return sortedData
  }

  const preparePaymentDistribution = () => {
    const paid = filteredRecords.filter(
      (r) => r.paymentStatus === 'paid'
    ).length
    const pending = filteredRecords.filter(
      (r) => r.paymentStatus === 'pending'
    ).length

    console.log('Payment distribution - paid:', paid, 'pending:', pending)

    return [
      { name: 'Paid', value: paid, color: '#10B981' },
      { name: 'Pending', value: pending, color: '#F59E0B' },
    ]
  }

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  )
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)

  const getAreaName = (id: string) => {
    return PARKING_AREAS.find((area) => area.id === id)?.name || id
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString()
  }

  const formatDuration = (hours: number) => {
    return `${hours.toFixed(2)}h`
  }

  const totalRevenue = filteredRecords.reduce((sum, r) => sum + r.amountPaid, 0)
  const paidRecords = filteredRecords.filter(
    (r) => r.paymentStatus === 'paid'
  ).length
  const pendingRecords = filteredRecords.filter(
    (r) => r.paymentStatus === 'pending'
  ).length

  console.log('=== RENDER STATS ===')
  console.log('filteredRecords length:', filteredRecords.length)
  console.log('totalRevenue:', totalRevenue)
  console.log('paidRecords:', paidRecords)
  console.log('pendingRecords:', pendingRecords)

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-6'>
      <header className='mb-8'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Reports & Analytics
            </h1>
            <p className='text-gray-600 mt-1'>
              {user?.role === 'admin'
                ? 'System-wide Reports'
                : `Your Area Reports (${user?.email})`}
            </p>
          </div>
          <Button
            title='← Back to Dashboard'
            btnStyle='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition text-gray-700'
            onClick={() =>
              navigate(
                user?.role === 'admin'
                  ? '/admin/dashboard'
                  : '/operator/dashboard'
              )
            }
          />
        </div>
      </header>

      <section className='bg-white rounded-2xl shadow-sm border p-6 mb-8'>
        <h2 className='text-xl font-semibold text-gray-900 mb-6'>
          Search & Filter
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              License Plate
            </label>
            <input
              type='text'
              placeholder='Search by plate...'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              value={filters.licensePlate || ''}
              onChange={(e) =>
                setFilters({ ...filters, licensePlate: e.target.value })
              }
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Start Date
            </label>
            <input
              type='date'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              value={filters.startDate || ''}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              End Date
            </label>
            <input
              type='date'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              value={filters.endDate || ''}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>
          {user?.role === 'admin' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Parking Area
              </label>
              <select
                className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                value={filters.parkingAreaId || 'all'}
                onChange={(e) =>
                  setFilters({ ...filters, parkingAreaId: e.target.value })
                }
              >
                <option value='all'>All Areas</option>
                {PARKING_AREAS.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Payment Status
            </label>
            <select
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              value={filters.paymentStatus || 'all'}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  paymentStatus: e.target.value as 'paid' | 'pending' | 'all',
                })
              }
            >
              <option value='all'>All Status</option>
              <option value='paid'>Paid</option>
              <option value='pending'>Pending</option>
            </select>
          </div>
        </div>

        <div className='flex justify-between items-center'>
          <Button
            title={
              <>
                <svg
                  className='w-5 h-5 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
                Search Records
              </>
            }
            btnStyle='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition'
            onClick={handleSearch}
          />

          <div className='flex gap-3'>
            <Button
              title='📄 Export CSV'
              btnStyle='px-6 py-3 bg-gray-200 hover:bg-gray-300 text-black font-medium rounded-lg flex items-center gap-2 transition shadow-lg'
              onClick={() => handleExport('csv')}
            />
            <Button
              title='📊 Export PDF'
              btnStyle='px-6 py-3 bg-gray-200 hover:bg-gray-300 text-black font-medium rounded-lg flex items-center gap-2 transition shadow-lg'
              onClick={() => handleExport('pdf')}
            />
          </div>
        </div>
      </section>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <StatCard
          title='Total Records'
          value={filteredRecords.length}
          color='blue'
          glow
        />
        <StatCard
          title='Total Revenue'
          value={`$${totalRevenue.toFixed(2)}`}
          color='green'
          glow
        />
        <StatCard
          title='Paid Records'
          value={paidRecords}
          color='purple'
          glow
        />
        <StatCard
          title='Pending Payments'
          value={pendingRecords}
          color='yellow'
          glow
        />
      </div>

      <section className='bg-white rounded-2xl shadow-sm border p-6 mb-8'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Visual Reports
          </h2>

          <div className='flex gap-2'>
            <Button
              title='Daily'
              btnStyle={`px-4 py-2 rounded-lg ${
                viewMode === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setViewMode('daily')}
            />
            <Button
              title='Monthly'
              btnStyle={`px-4 py-2 rounded-lg ${
                viewMode === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200'
              }`}
              onClick={() => setViewMode('monthly')}
            />
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Revenue Trend ({viewMode === 'daily' ? 'Daily' : 'Monthly'})
            </h3>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={prepareRevenueData()}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey={viewMode === 'daily' ? 'date' : 'month'} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='revenue'
                    stroke='#3B82F6'
                    strokeWidth={2}
                  />
                  <Line
                    type='monotone'
                    dataKey='vehicles'
                    stroke='#10B981'
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Payment Distribution
            </h3>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={preparePaymentDistribution()}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {preparePaymentDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className='mt-8'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>
            Vehicles per Parking Area
          </h3>
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={prepareVehiclesPerArea()}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='name'
                  angle={-45}
                  textAnchor='end'
                  height={60}
                />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Vehicles']} />
                <Legend />
                <Bar dataKey='vehicles' fill='#8B5CF6' />
                <Bar dataKey='revenue' fill='#10B981' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className='bg-white rounded-2xl shadow-sm border overflow-hidden'>
        <div className='p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Parking Records ({filteredRecords.length} records found)
          </h2>
          {filteredRecords.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              <p>No records found for your assigned areas.</p>
              <p className='text-sm mt-2'>
                Assigned Areas:{' '}
                {user?.assignedParkingAreas?.join(', ') || 'None'}
              </p>
            </div>
          )}
        </div>

        {filteredRecords.length > 0 && (
          <>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50 text-gray-600'>
                  <tr>
                    <th className='px-6 py-3 text-left'>License Plate</th>
                    <th className='px-6 py-3 text-left'>Area</th>
                    <th className='px-6 py-3 text-left'>Entry Time</th>
                    <th className='px-6 py-3 text-left'>Exit Time</th>
                    <th className='px-6 py-3 text-left'>Duration</th>
                    <th className='px-6 py-3 text-left'>Amount</th>
                    <th className='px-6 py-3 text-left'>Status</th>
                    <th className='px-6 py-3 text-left'>Actions</th>
                  </tr>
                </thead>

                <tbody className='divide-y'>
                  {currentRecords.map((record) => (
                    <tr
                      key={record.id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4'>
                        <span className='font-medium text-gray-900'>
                          {record.licensePlate}
                        </span>
                        <div className='text-xs text-gray-500 capitalize'>
                          {record.vehicleType}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        {getAreaName(record.parkingAreaId)}
                      </td>
                      <td className='px-6 py-4'>
                        {formatDateTime(record.entryTime)}
                      </td>
                      <td className='px-6 py-4'>
                        {record.exitTime
                          ? formatDateTime(record.exitTime)
                          : 'Active'}
                      </td>
                      <td className='px-6 py-4'>
                        {record.durationHours > 0
                          ? formatDuration(record.durationHours)
                          : 'N/A'}
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`font-medium ${
                            record.amountPaid > 0
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }`}
                        >
                          ${record.amountPaid.toFixed(2)}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            record.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {record.paymentStatus}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex gap-2'>
                          <Button
                            title='View'
                            btnStyle='px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition'
                            onClick={() =>
                              console.log('View details:', record.id)
                            }
                          />
                          {record.paymentStatus === 'paid' && (
                            <Button
                              title='Receipt'
                              btnStyle='px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition'
                              onClick={() =>
                                console.log('Reprint receipt:', record.id)
                              }
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className='px-6 py-4 border-t flex justify-between items-center'>
                <div className='text-sm text-gray-600'>
                  Showing {indexOfFirstRecord + 1}-
                  {Math.min(indexOfLastRecord, filteredRecords.length)} of{' '}
                  {filteredRecords.length}
                </div>
                <div className='flex gap-2'>
                  <Button
                    title='Previous'
                    btnStyle='px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50'
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        title={pageNum.toString()}
                        btnStyle={`px-4 py-2 border rounded ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setCurrentPage(pageNum)}
                      />
                    )
                  })}

                  <Button
                    title='Next'
                    btnStyle='px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50'
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
