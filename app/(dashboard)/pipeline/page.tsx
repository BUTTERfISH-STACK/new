'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { DealCard } from '@/components/pipeline/deal-card'
import { DealColumn } from '@/components/pipeline/deal-column'
import { CreateDealDialog } from '@/components/pipeline/create-deal-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  LayoutGrid, 
  List, 
  Calendar, 
  Flame,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  X
} from 'lucide-react'
import { DealStage, Deal } from '@/types'
import { cn } from '@/lib/utils'

// Table view component
function TableView({ deals, onEdit }: { deals: Deal[]; onEdit?: (deal: Deal) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-sm text-muted-foreground">
            <th className="pb-3 font-medium">Deal</th>
            <th className="pb-3 font-medium">Company</th>
            <th className="pb-3 font-medium">Value</th>
            <th className="pb-3 font-medium">Stage</th>
            <th className="pb-3 font-medium">Probability</th>
            <th className="pb-3 font-medium">Expected Close</th>
            <th className="pb-3 font-medium">Weighted</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => onEdit?.(deal)}>
              <td className="py-3 font-medium">{deal.title}</td>
              <td className="py-3">{deal.company?.name || '-'}</td>
              <td className="py-3 font-semibold">${deal.value.toLocaleString()}</td>
              <td className="py-3">
                <span className={cn(
                  "px-2 py-1 rounded text-xs",
                  deal.stage === 'CLOSED_WON' && "bg-green-100 text-green-700",
                  deal.stage === 'CLOSED_LOST' && "bg-red-100 text-red-700",
                  deal.stage === 'NEGOTIATION' && "bg-purple-100 text-purple-700",
                  deal.stage === 'PROPOSAL' && "bg-indigo-100 text-indigo-700",
                  deal.stage === 'QUALIFIED' && "bg-blue-100 text-blue-700",
                  deal.stage === 'LEAD' && "bg-gray-100 text-gray-700"
                )}>
                  {deal.stage.replace('_', ' ')}
                </span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        deal.probability >= 75 ? "bg-green-500" :
                        deal.probability >= 50 ? "bg-blue-500" :
                        deal.probability >= 25 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${deal.probability}%` }}
                    />
                  </div>
                  <span className="text-sm">{deal.probability}%</span>
                </div>
              </td>
              <td className="py-3">
                {deal.expectedCloseDate 
                  ? new Date(deal.expectedCloseDate).toLocaleDateString() 
                  : '-'}
              </td>
              <td className="py-3 font-medium text-primary">
                ${Math.round(deal.value * deal.probability / 100).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Timeline view component
function TimelineView({ deals }: { deals: Deal[] }) {
  const stageColors: Record<string, string> = {
    LEAD: 'bg-gray-400',
    QUALIFIED: 'bg-blue-400',
    PROPOSAL: 'bg-indigo-400',
    NEGOTIATION: 'bg-purple-400',
    CLOSED_WON: 'bg-green-400',
    CLOSED_LOST: 'bg-red-400',
  }

  return (
    <div className="space-y-4">
      {deals.map((deal) => (
        <div key={deal.id} className="flex items-center gap-4 p-4 border rounded-lg bg-card">
          <div className="w-48 font-medium truncate">{deal.title}</div>
          <div className="flex-1 h-10 bg-muted rounded-full overflow-hidden relative">
            <div 
              className={cn("h-full absolute left-0 top-0", stageColors[deal.stage])}
              style={{ width: `${(deal.probability)}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
              ${deal.value.toLocaleString()}
            </span>
          </div>
          <div className="w-32 text-sm text-muted-foreground">
            {deal.expectedCloseDate 
              ? new Date(deal.expectedCloseDate).toLocaleDateString() 
              : 'No date'}
          </div>
          <div className="w-20 text-sm font-medium text-primary">
            ${Math.round(deal.value * deal.probability / 100).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}

// Revenue Heatmap component
function RevenueHeatmap({ deals }: { deals: Deal[] }) {
  const stageValues = deals.reduce((acc, deal) => {
    acc[deal.stage] = (acc[deal.stage] || 0) + deal.value
    return acc
  }, {} as Record<string, number>)

  const maxValue = Math.max(...Object.values(stageValues), 1)
  
  const stages = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']
  const colors = ['#94a3b8', '#60a5fa', '#a78bfa', '#f472b6', '#22c55e', '#ef4444']

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stages.map((stage, idx) => {
        const value = stageValues[stage] || 0
        const intensity = value / maxValue
        return (
          <div 
            key={stage}
            className="p-4 rounded-lg border text-center"
            style={{ 
              backgroundColor: `${colors[idx]}${Math.round(intensity * 50).toString(16).padStart(2, '0')}`,
              borderColor: colors[idx]
            }}
          >
            <p className="text-xs text-muted-foreground mb-1">
              {stage.replace('_', ' ')}
            </p>
            <p className="text-lg font-bold">${value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {deals.filter(d => d.stage === stage).length} deals
            </p>
          </div>
        )
      })}
    </div>
  )
}

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

type PipelineView = 'kanban' | 'table' | 'timeline' | 'heatmap'

const VIEW_OPTIONS: { value: PipelineView; label: string; icon: typeof LayoutGrid }[] = [
  { value: 'kanban', label: 'Kanban', icon: LayoutGrid },
  { value: 'table', label: 'Table', icon: List },
  { value: 'timeline', label: 'Timeline', icon: Calendar },
  { value: 'heatmap', label: 'Heatmap', icon: Flame },
]

interface PipelineStats {
  totalValue: number
  weightedValue: number
  wonValue: number
  avgProbability: number
  dealsCount: number
}

export default function PipelinePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [view, setView] = useState<PipelineView>('kanban')
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<DealStage | 'ALL'>('ALL')
  const [minValue, setMinValue] = useState<number>(0)
  const [showFilters, setShowFilters] = useState(false)

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
    setLoading(true)
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

  // Check if we should open create dialog from URL
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setCreateOpen(true)
      router.replace('/pipeline')
    }
  }, [searchParams, router])

  // Filter deals based on search and filters
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = deal.title.toLowerCase().includes(query)
        const matchesCompany = deal.company?.name.toLowerCase().includes(query)
        const matchesContact = deal.contact ? 
          `${deal.contact.firstName} ${deal.contact.lastName}`.toLowerCase().includes(query) 
          : false
        if (!matchesTitle && !matchesCompany && !matchesContact) return false
      }
      
      // Stage filter
      if (stageFilter !== 'ALL' && deal.stage !== stageFilter) return false
      
      // Min value filter
      if (deal.value < minValue) return false
      
      return true
    })
  }, [deals, searchQuery, stageFilter, minValue])

  // Calculate stats
  const stats: PipelineStats = useMemo(() => {
    const activeDeals = filteredDeals.filter(d => !['CLOSED_WON', 'CLOSED_LOST'].includes(d.stage))
    const wonDeals = filteredDeals.filter(d => d.stage === 'CLOSED_WON')
    
    return {
      totalValue: filteredDeals.reduce((sum, d) => sum + d.value, 0),
      weightedValue: filteredDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0),
      wonValue: wonDeals.reduce((sum, d) => sum + d.value, 0),
      avgProbability: activeDeals.length > 0 
        ? Math.round(activeDeals.reduce((sum, d) => sum + d.probability, 0) / activeDeals.length)
        : 0,
      dealsCount: filteredDeals.length
    }
  }, [filteredDeals])

  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = filteredDeals.filter((deal) => deal.stage === stage)
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

    const deal = deals.find((d) => d.id === dealId)
    if (!deal) return

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
        // Rollback on error
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

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setStageFilter('ALL')
    setMinValue(0)
  }

  const hasActiveFilters = searchQuery || stageFilter !== 'ALL' || minValue > 0

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
      <div className="border-b p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pipeline</h1>
            <p className="text-sm text-muted-foreground">
              {view === 'kanban' 
                ? 'Drag and drop deals to update their stage'
                : view === 'table'
                ? 'View deals in table format'
                : view === 'timeline'
                ? 'View deal progress timeline'
                : 'Revenue distribution by stage'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              {VIEW_OPTIONS.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setView(option.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                      view === option.value 
                        ? "bg-background shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title={option.label}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{option.label}</span>
                  </button>
                )
              })}
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Deal
            </Button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <DollarSign className="h-3 w-3" />
              Total Value
            </div>
            <div className="text-lg font-bold">${stats.totalValue.toLocaleString()}</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Target className="h-3 w-3" />
              Weighted Value
            </div>
            <div className="text-lg font-bold text-primary">${Math.round(stats.weightedValue).toLocaleString()}</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" />
              Won Value
            </div>
            <div className="text-lg font-bold text-green-600">${stats.wonValue.toLocaleString()}</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Clock className="h-3 w-3" />
              Avg Probability
            </div>
            <div className="text-lg font-bold">{stats.avgProbability}%</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <LayoutGrid className="h-3 w-3" />
              Total Deals
            </div>
            <div className="text-lg font-bold">{stats.dealsCount}</div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deals, companies, contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={fetchDeals}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Stage</label>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value as DealStage | 'ALL')}
              >
                <option value="ALL">All Stages</option>
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>{STAGE_LABELS[stage]}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Min Value</label>
              <Input
                type="number"
                placeholder="0"
                value={minValue || ''}
                onChange={(e) => setMinValue(parseInt(e.target.value) || 0)}
                className="h-9 w-32"
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              Showing {filteredDeals.length} of {deals.length} deals
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Content */}
      <div className="flex-1 overflow-auto p-6">
        {view === 'kanban' && (
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
        )}

        {view === 'table' && <TableView deals={filteredDeals} />}
        
        {view === 'timeline' && <TimelineView deals={filteredDeals} />}
        
        {view === 'heatmap' && <RevenueHeatmap deals={filteredDeals} />}
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
