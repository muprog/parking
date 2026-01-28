import { DailyReport, MonthlyReport } from '../types/types'

export const DAILY_REPORTS: DailyReport[] = [
  // Area 1 - Only Jan 24 (since that's all we have in parking records)
  {
    id: '1',
    date: '2026-01-24',
    parkingAreaId: '1',
    totalVehicles: 3,
    totalRevenue: 17.5,
  },
  // REMOVED Jan 18-23 reports since we don't have parking records for them

  // Area 2 - Only Jan 24
  {
    id: '2',
    date: '2026-01-24',
    parkingAreaId: '2',
    totalVehicles: 2,
    totalRevenue: 12.5,
  },

  // Area 3 - Only Jan 24
  {
    id: '3',
    date: '2026-01-24',
    parkingAreaId: '3',
    totalVehicles: 2,
    totalRevenue: 8.0,
  },

  // Area 4 - Only Jan 24
  {
    id: '4',
    date: '2026-01-24',
    parkingAreaId: '4',
    totalVehicles: 12,
    totalRevenue: 120.0,
  },

  // Area 5 - Only Jan 24
  {
    id: '5',
    date: '2026-01-24',
    parkingAreaId: '5',
    totalVehicles: 25,
    totalRevenue: 112.5,
  },

  // Area 6 - Jan 24 AND Jan 23 (we have records for both)
  {
    id: '6',
    date: '2026-01-24',
    parkingAreaId: '6',
    totalVehicles: 2,
    totalRevenue: 24.0,
  },
  {
    id: '7',
    date: '2026-01-23',
    parkingAreaId: '6',
    totalVehicles: 15,
    totalRevenue: 180.0,
  },

  // Area 7 - Jan 24 AND Jan 23 (we have records for both)
  {
    id: '8',
    date: '2026-01-24',
    parkingAreaId: '7',
    totalVehicles: 2,
    totalRevenue: 50.0,
  },
  {
    id: '9',
    date: '2026-01-23',
    parkingAreaId: '7',
    totalVehicles: 20,
    totalRevenue: 400.0,
  },
]

export const MONTHLY_REPORTS: MonthlyReport[] = [
  // Jan 2026 - Calculated ONLY from the daily reports we actually have data for
  {
    id: '1',
    month: '2026-01',
    parkingAreaId: '1',
    totalRevenue: 17.5, // Only Jan 24
    totalVehicles: 3,
  },
  {
    id: '2',
    month: '2026-01',
    parkingAreaId: '2',
    totalRevenue: 12.5, // Only Jan 24
    totalVehicles: 2,
  },
  {
    id: '3',
    month: '2026-01',
    parkingAreaId: '3',
    totalRevenue: 8.0, // Only Jan 24
    totalVehicles: 2,
  },
  {
    id: '4',
    month: '2026-01',
    parkingAreaId: '4',
    totalRevenue: 120.0, // Only Jan 24
    totalVehicles: 12,
  },
  {
    id: '5',
    month: '2026-01',
    parkingAreaId: '5',
    totalRevenue: 112.5, // Only Jan 24
    totalVehicles: 25,
  },
  {
    id: '6',
    month: '2026-01',
    parkingAreaId: '6',
    totalRevenue: 204.0, // Jan 24 ($24) + Jan 23 ($180)
    totalVehicles: 17, // 2 + 15
  },
  {
    id: '7',
    month: '2026-01',
    parkingAreaId: '7',
    totalRevenue: 450.0, // Jan 24 ($50) + Jan 23 ($400)
    totalVehicles: 22, // 2 + 20
  },

  // Optional: Keep Dec 2025 if you want, but remove if no parking records exist
  {
    id: '8',
    month: '2025-12',
    parkingAreaId: '1',
    totalRevenue: 0, // Set to 0 since we have no parking records
    totalVehicles: 0,
  },
  {
    id: '9',
    month: '2025-12',
    parkingAreaId: '2',
    totalRevenue: 0,
    totalVehicles: 0,
  },
  {
    id: '10',
    month: '2025-12',
    parkingAreaId: '6',
    totalRevenue: 0,
    totalVehicles: 0,
  },
  {
    id: '11',
    month: '2025-12',
    parkingAreaId: '7',
    totalRevenue: 0,
    totalVehicles: 0,
  },
]
