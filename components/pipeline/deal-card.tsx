'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { Deal } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Building2, User, Calendar, TrendingUp, DollarSign } from 'lucide-react'

interface DealCardProps {
  deal: Deal
  isDragging?: boolean
}

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  ZAR: 'R',
}

export function DealCard({ deal, isDragging }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  
  const currencySymbol = CURRENCY_SYMBOLS[deal.currency || 'USD'] || '$'
  
  // Format value with currency
  const formatDealValue = (value: number, currency?: string) => {
    const symbol = CURRENCY_SYMBOLS[currency || 'USD'] || '$'
    return `${symbol}${value.toLocaleString()}`
  }
  
  // Get stage color
  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      LEAD: 'bg-slate-500',
      QUALIFIED: 'bg-blue-500',
      PROPOSAL: 'bg-violet-500',
      NEGOTIATION: 'bg-pink-500',
      CLOSED_WON: 'bg-green-500',
      CLOSED_LOST: 'bg-red-500',
    }
    return colors[stage] || 'bg-gray-500'
  }
  
  // Get probability color
  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'bg-green-500'
    if (probability >= 50) return 'bg-blue-500'
    if (probability >= 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  // Check if deal is overdue
  const isOverdue = deal.expectedCloseDate && 
    new Date(deal.expectedCloseDate) < new Date() && 
    !['CLOSED_WON', 'CLOSED_LOST'].includes(deal.stage)
  
  // Days until close
  const getDaysUntilClose = () => {
    if (!deal.expectedCloseDate) return null
    const closeDate = new Date(deal.expectedCloseDate)
    const today = new Date()
    const diffTime = closeDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  
  const daysUntilClose = getDaysUntilClose()

  return (
    <Link
      href={`/pipeline?dealId=${deal.id}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`block rounded-lg border bg-card shadow-sm transition-all hover:shadow-md ${
        isDragging || isSortableDragging 
          ? 'opacity-50 ring-2 ring-primary scale-105' 
          : ''
      } ${isOverdue ? 'border-red-300 bg-red-50/50' : ''}`}
      onClick={(e) => {
        if (isDragging || isSortableDragging) {
          e.preventDefault()
        }
      }}
    >
      <div className="space-y-3 p-4">
        {/* Header with Stage Badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-2 text-sm">{deal.title}</h3>
          <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs text-white ${getStageColor(deal.stage)}`}>
            {deal.stage.replace('_', ' ')}
          </span>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-2">
          <div className="text-xl font-bold text-primary flex items-center">
            <DollarSign className="h-4 w-4" />
            {deal.value.toLocaleString()}
          </div>
          {deal.currency && deal.currency !== 'USD' && (
            <span className="text-xs text-muted-foreground">{deal.currency}</span>
          )}
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-2 text-xs">
          {deal.company && (
            <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              <span className="line-clamp-1 max-w-[100px]">{deal.company.name}</span>
            </div>
          )}
          {deal.contact && (
            <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="line-clamp-1 max-w-[80px]">
                {deal.contact.firstName} {deal.contact.lastName?.charAt(0)}.
              </span>
            </div>
          )}
        </div>

        {/* Expected Close Date */}
        {deal.expectedCloseDate && (
          <div className={`flex items-center gap-1 text-xs ${
            isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
          }`}>
            <Calendar className={`h-3 w-3 ${isOverdue ? 'text-red-500' : ''}`} />
            <span>
              {new Date(deal.expectedCloseDate).toLocaleDateString()}
              {daysUntilClose !== null && (
                <span className={daysUntilClose < 0 ? 'text-red-500' : daysUntilClose <= 7 ? 'text-yellow-600' : ''}>
                  {' '}({daysUntilClose < 0 ? `${Math.abs(daysUntilClose)}d overdue` : `${daysUntilClose}d`})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Probability Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Win Probability
            </span>
            <span className={`font-medium ${
              deal.probability >= 75 ? 'text-green-600' : 
              deal.probability >= 50 ? 'text-blue-600' : 
              deal.probability >= 25 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {deal.probability}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getProbabilityColor(deal.probability)}`}
              style={{ width: `${deal.probability}%` }}
            />
          </div>
        </div>

        {/* Weighted Value */}
        <div className="pt-2 border-t border-muted">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Weighted Value</span>
            <span className="font-semibold">
              {formatDealValue(Math.round(deal.value * deal.probability / 100), deal.currency)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
