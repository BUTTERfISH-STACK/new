'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DealCard } from '@/components/pipeline/deal-card'
import { DealColumn } from '@/components/pipeline/deal-column'
import { CreateDealDialog } from '@/components/pipeline/create-deal-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DealStage, Deal } from '@/types'

const STAGES: DealStage[] = [
  'LEAD',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
]

const STAGE_LABELS: Record<DealStage, string> = {
  LEAD: 'Lead',
  QUALIFIED: 'Qualified',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
}

export default function PipelinePage() {
  const router = useRouter()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/deals')
      if (res.ok) {
        const data = await res.json()
        setDeals(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch deals:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter((deal) => deal.stage === stage)
    return acc
  }, {} as Record<DealStage, Deal[]>)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const dealId = active.id as string
    const newStage = over.id as DealStage

    // Find the deal
    const deal = deals.find((d) => d.id === dealId)
    if (!deal) return

    // If dropped on same stage, do nothing
    if (deal.stage === newStage) return

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, stage: newStage } : d
      )
    )

    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })

      if (!res.ok) {
        // Revert on failure
        setDeals((prev) =>
          prev.map((d) =>
            d.id === dealId ? { ...d, stage: deal.stage } : d
          )
        )
        toast.error('Failed to update deal stage')
      } else {
        toast.success(`Deal moved to ${STAGE_LABELS[newStage]}`)
      }
    } catch (error) {
      console.error('Failed to update deal:', error)
      setDeals((prev) =>
        prev.map((d) =>
          d.id === dealId ? { ...d, stage: deal.stage } : d
        )
      )
      toast.error('Failed to update deal stage')
    }
  }

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <div
              key={stage}
              className="min-w-[280px] flex-1 rounded-lg bg-muted/50 p-4"
            >
              <div className="mb-4 h-6 w-24 animate-pulse rounded bg-muted" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded bg-muted" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-6">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Drag and drop deals to update their stage
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Deal
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => (
              <DealColumn
                key={stage}
                stage={stage}
                label={STAGE_LABELS[stage]}
                deals={dealsByStage[stage]}
              />
            ))}
          </div>

          <DragOverlay>
            {activeDeal ? (
              <DealCard deal={activeDeal} isDragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create Deal Dialog */}
      <CreateDealDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={(deal) => {
          setDeals((prev) => [deal, ...prev])
          setCreateOpen(false)
        }}
      />
    </div>
  )
}
