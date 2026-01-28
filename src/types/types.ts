export interface User {
  id: string
  email: string
  password: string
  name: string
  role: 'admin' | 'operator'
  phone?: string
  assignedParkingAreas?: string[]
  shift?: 'morning' | 'afternoon' | 'night'
}

export interface DailyReport {
  id: string
  date: string
  parkingAreaId: string
  totalVehicles: number
  totalRevenue: number
}

export interface MonthlyReport {
  id: string
  month: string
  parkingAreaId: string
  totalRevenue: number
  totalVehicles: number
}

export interface ParkingRecord {
  id: string
  licensePlate: string
  parkingAreaId: string
  entryTime: string
  exitTime: string | null
  durationHours: number
  amountPaid: number
  paymentStatus: 'pending' | 'paid'
  vehicleType: 'car' | 'motorcycle' | 'truck'
}

export interface ParkingArea {
  id: string
  name: string
  location: string
  totalSpaces: number
  hourlyRate: number
  currentOccupancy: number
  status: 'active' | 'maintenance' | 'closed'
}

export interface DashboardStats {
  totalAreas: number
  totalSpaces: number
  occupiedSpaces: number
  occupancyRate: number
  todayRevenue: number
  monthlyRevenue: number
  activeOperators: number
  pendingPayments: number
  topPerformerName: string
  topPerformerEfficiency: number
}

export interface OperatorPerformance {
  id: string
  name: string
  email: string
  assignedAreasCount: number
  totalVehiclesManaged: number
  totalRevenueGenerated: number
  efficiency: number // 0-100 score
  shift: 'morning' | 'afternoon' | 'night'
}

export interface SearchFilters {
  licensePlate?: string
  startDate?: string
  endDate?: string
  parkingAreaId?: string
  paymentStatus?: 'paid' | 'pending' | 'all'
}

export interface ReportStats {
  totalRevenue: number
  totalVehicles: number
  avgDuration: number
  occupancyRate: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
  }[]
}
