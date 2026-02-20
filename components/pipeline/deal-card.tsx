'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { Deal } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Building2, User, Calendar } from 'lucide-react'

interface DealCardProps {
  deal: Deal
  isDragging?: boolean
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

  return (
    <Link
      href={`/deals/${deal.id}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`block rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${
        isDragging || isSortableDragging ? 'opacity-50 ring-2 ring-primary' : ''
      }`}
      onClick={(e) => {
        if (isDragging || isSortableDragging) {
          e.preventDefault()
        }
      }}
    >
      <div className="space-y-3">
        {/* Title */}
        <h3 className="font-semibold line-clamp-2">{deal.title}</h3>

        {/* Value */}
        <div className="text-lg font-bold text-primary">
          {formatCurrency(deal.value)}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {deal.company && (
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span className="line-clamp-1">{deal.company.name}</span>
            </div>
          )}
          {deal.contact && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="line-clamp-1">
                {deal.contact.firstName} {deal.contact.lastName}
              </span>
            </div>
          )}
        </div>

        {/* Expected Close Date */}
        {deal.expectedCloseDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(deal.expectedCloseDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Probability */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${deal.probability}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {deal.probability}%
          </span>
        </div>
      </div>
    </Link>
  )
}
