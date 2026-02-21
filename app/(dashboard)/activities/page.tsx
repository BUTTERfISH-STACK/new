'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HoverTooltip } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Activity, ActivityType } from '@/types'
import { formatDate } from '@/lib/utils'
import { Plus, Phone, Mail, Users, FileText } from 'lucide-react'

const ACTIVITY_ICONS: Record<ActivityType, typeof Phone> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  NOTE: FileText,
}

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  CALL: 'bg-blue-100 text-blue-600',
  EMAIL: 'bg-green-100 text-green-600',
  MEETING: 'bg-purple-100 text-purple-600',
  NOTE: 'bg-gray-100 text-gray-600',
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: 'NOTE' as ActivityType,
    description: '',
    dealId: '',
  })
  const [deals, setDeals] = useState<{ id: string; title: string }[]>([])

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities?limit=50')
      if (res.ok) {
        const data = await res.json()
        setActivities(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/deals?limit=100')
      if (res.ok) {
        const data = await res.json()
        setDeals(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch deals:', error)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  useEffect(() => {
    if (createOpen) {
      fetchDeals()
    }
  }, [createOpen])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dealId: formData.dealId || null,
        }),
      })

      if (res.ok) {
        const activity = await res.json()
        setActivities([activity, ...activities])
        setCreateOpen(false)
        setFormData({ type: 'NOTE', description: '', dealId: '' })
        toast.success('Activity logged successfully')
      } else {
        toast.error('Failed to log activity')
      }
    } catch (error) {
      console.error('Failed to log activity:', error)
      toast.error('Failed to log activity')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activities</h1>
          <p className="text-sm text-muted-foreground">
            Track calls, emails, meetings, and notes
          </p>
        </div>
        <HoverTooltip content="Log a new activity (call, email, meeting, or note)">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Activity
          </Button>
        </HoverTooltip>
      </div>

      {/* Activities List */}
      {activities.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">No activities logged yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type]
            return (
              <Card key={activity.id}>
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`rounded-full p-2 ${ACTIVITY_COLORS[activity.type]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.type}</span>
                      {activity.deal && (
                        <span className="text-sm text-muted-foreground">
                          • {activity.deal.title}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm">{activity.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
            <DialogDescription>
              Record a call, email, meeting, or note
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as ActivityType })
                }
              >
                <option value="CALL">Call</option>
                <option value="EMAIL">Email</option>
                <option value="MEETING">Meeting</option>
                <option value="NOTE">Note</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="What happened?"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Related Deal</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.dealId}
                onChange={(e) =>
                  setFormData({ ...formData, dealId: e.target.value })
                }
              >
                <option value="">No deal</option>
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <HoverTooltip content="Save this activity to your log">
              <Button type="submit">Log Activity</Button>
            </HoverTooltip>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
