import { USERS } from './users'
import { PARKING_AREAS } from './parkingAreas'
import { PARKING_RECORDS } from './parkingRecords'
import { DAILY_REPORTS, MONTHLY_REPORTS } from './reports'

export { USERS, PARKING_AREAS, PARKING_RECORDS, DAILY_REPORTS, MONTHLY_REPORTS }

export const getOperatorPerformance = () => {
  const operators = USERS.filter((user) => user.role === 'operator')

  return operators.map((operator) => {
    const assignedAreas = PARKING_AREAS.filter((area) =>
      operator.assignedParkingAreas?.includes(area.id)
    )

    const areaIds = assignedAreas.map((area) => area.id)
    const operatorRecords = PARKING_RECORDS.filter((record) =>
      areaIds.includes(record.parkingAreaId)
    )

    const paidRecords = operatorRecords.filter(
      (record) => record.paymentStatus === 'paid'
    )
    const totalRevenue = paidRecords.reduce(
      (sum, record) => sum + record.amountPaid,
      0
    )
    const totalVehicles = operatorRecords.length

    const totalCapacity = assignedAreas.reduce(
      (sum, area) => sum + area.totalSpaces,
      0
    )
    const totalOccupied = assignedAreas.reduce(
      (sum, area) => sum + area.currentOccupancy,
      0
    )
    const avgUtilization =
      totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0

    const revenuePerVehicle =
      totalVehicles > 0 ? totalRevenue / totalVehicles : 0
    const efficiency = Math.round(
      avgUtilization * 0.6 + Math.min(revenuePerVehicle * 10, 40)
    )

    return {
      id: operator.id,
      name: operator.name,
      email: operator.email,
      assignedAreasCount: assignedAreas.length,
      totalVehiclesManaged: totalVehicles,
      totalRevenueGenerated: totalRevenue,
      efficiency: Math.min(efficiency, 100),
      shift: operator.shift || ('morning' as 'morning' | 'afternoon' | 'night'),
    }
  })
}

export const getDashboardStats = () => {
  const totalSpaces = PARKING_AREAS.reduce(
    (sum, area) => sum + area.totalSpaces,
    0
  )
  const occupiedSpaces = PARKING_AREAS.reduce(
    (sum, area) => sum + area.currentOccupancy,
    0
  )
  const todayRevenue = DAILY_REPORTS.filter(
    (r) => r.date === '2026-01-24'
  ).reduce((sum, r) => sum + r.totalRevenue, 0)
  const pendingPayments = PARKING_RECORDS.filter(
    (r) => r.paymentStatus === 'pending'
  ).length
  const operatorPerformance = getOperatorPerformance()
  const topPerformer =
    operatorPerformance.length > 0
      ? operatorPerformance.reduce((best, current) =>
          current.efficiency > best.efficiency ? current : best
        )
      : null
  return {
    totalAreas: PARKING_AREAS.length,
    totalSpaces,
    occupiedSpaces,
    occupancyRate: Math.round((occupiedSpaces / totalSpaces) * 100),
    todayRevenue,
    monthlyRevenue: 156789.45,
    activeOperators: USERS.filter((u) => u.role === 'operator').length,
    pendingPayments,
    topPerformerName: topPerformer?.name || 'N/A',
    topPerformerEfficiency: topPerformer?.efficiency || 0,
  }
}

export const getOperatorData = (operatorId: string) => {
  const operator = USERS.find((u) => u.id === operatorId)
  if (!operator || operator.role !== 'operator')
    return { areas: [], records: [] }

  const assignedAreas = PARKING_AREAS.filter((area) =>
    operator.assignedParkingAreas?.includes(area.id)
  )

  const areaIds = assignedAreas.map((a) => a.id)
  const records = PARKING_RECORDS.filter((record) =>
    areaIds.includes(record.parkingAreaId)
  )

  return { areas: assignedAreas, records }
}
