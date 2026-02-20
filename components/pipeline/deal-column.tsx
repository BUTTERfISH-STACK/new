'use client'

import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Deal } from '@/types'
import { DealCard } from './deal-card'
import { formatCurrency } from '@/lib/utils'

interface DealColumnProps {
  stage: string
  label: string
  deals: Deal[]
}

const STAGE_COLORS: Record<string, string> = {
  LEAD: 'bg-slate-500',
  QUALIFIED: 'bg-blue-400',
  PROPOSAL: 'bg-violet-400',
  NEGOTIATION: 'bg-pink-400',
  CLOSED_WON: 'bg-green-500',
  CLOSED_LOST: 'bg-red-500',
}

export function DealColumn({ stage, label, deals }: DealColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  })

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[300px] flex-col rounded-lg bg-muted/30 ${
        isOver ? 'ring-2 ring-primary ring-opacity-50' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${STAGE_COLORS[stage]}`} />
          <h2 className="font-semibold">{label}</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
            {deals.length}
          </span>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {formatCurrency(totalValue)}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3 p-3">
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>

        {deals.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-sm text-muted-foreground">No deals</p>
          </div>
        )}
      </div>
    </div>
  )
}
