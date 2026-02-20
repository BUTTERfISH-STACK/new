import { DealStage, ActivityType } from '@prisma/client'

export type { DealStage, ActivityType }

export interface Company {
  id: string
  name: string
  industry?: string | null
  website?: string | null
  address?: string | null
  phone?: string | null
  createdAt: Date
  updatedAt: Date
  _count?: {
    contacts: number
    deals: number
  }
}

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  position?: string | null
  companyId?: string | null
  company?: Company | null
  createdAt: Date
  updatedAt: Date
}

export interface Deal {
  id: string
  title: string

  value: number
  stage: DealStage
  probability: number
  expectedCloseDate?: Date | null
  companyId?: string | null
  company?: Company | null
  contactId?: string | null
  contact?: Contact | null
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description?: string | null
  dueDate?: Date | null
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dealId?: string | null
  deal?: Deal | null
  createdAt: Date
  updatedAt: Date
}

export interface Activity {
  id: string
  type: ActivityType
  description: string
  dealId?: string | null
  deal?: Deal | null
  createdAt: Date
}

export interface PipelineStats {
  totalDeals: number
  totalValue: number
  forecast: number
  wonValue: number
  dealsByStage: Record<DealStage, number>
  valueByStage: Record<DealStage, number>
}

export interface DashboardData {
  stats: PipelineStats
  tasksDueToday: Task[]
  recentActivities: Activity[]
}

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form types
export interface CompanyFormData {
  name: string
  industry?: string
  website?: string
  address?: string
  phone?: string
}

export interface ContactFormData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  position?: string
  companyId?: string
}

export interface DealFormData {
  title: string
  value: number
  stage: DealStage
  probability: number
  expectedCloseDate?: Date
  companyId?: string
  contactId?: string
}

export interface TaskFormData {
  title: string
  description?: string
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high'
  dealId?: string
}

export interface ActivityFormData {
  type: ActivityType
  description: string
  dealId?: string
}
