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
import { Task } from '@/types'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { Plus, Search, CheckSquare, Calendar, Trash2, AlertCircle } from 'lucide-react'

interface FormErrors {
  title?: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dealId: '',
  })

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams()
      if (filter === 'pending') params.set('completed', 'false')
      if (filter === 'completed') params.set('completed', 'true')
      if (filter === 'overdue') params.set('overdue', 'true')
      params.set('limit', '50')
      
      const res = await fetch(`/api/tasks?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [filter])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate || null,
          dealId: formData.dealId || null,
        }),
      })

      if (res.ok) {
        const task = await res.json()
        setTasks([task, ...tasks])
        setCreateOpen(false)
        setFormData({ title: '', description: '', dueDate: '', priority: 'medium', dealId: '' })
        toast.success('Task created successfully')
      } else {
        const error = await res.json()
        // Handle validation errors from API
        if (error.details && Array.isArray(error.details)) {
          const newErrors: FormErrors = {}
          error.details.forEach((err: { path: string[]; message: string }) => {
            const field = err.path[0] as keyof FormErrors
            if (field) newErrors[field] = err.message
          })
          setErrors(newErrors)
          toast.error('Please fix the form errors')
        } else {
          toast.error(error.error || 'Failed to create task')
        }
      }
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    }
  }

  const handleToggleComplete = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      })

      if (res.ok) {
        const updated = await res.json()
        setTasks(tasks.map((t) => (t.id === task.id ? updated : t)))
        toast.success(task.completed ? 'Task marked incomplete' : 'Task completed')
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== id))
        toast.success('Task deleted')
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
    }
  }

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.completed) return false
    return new Date(task.dueDate) < new Date()
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
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
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
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Manage your tasks and action items
          </p>
        </div>
        <HoverTooltip content="Create a new task">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </HoverTooltip>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {(['all', 'pending', 'completed', 'overdue'] as const).map((f) => (
          <HoverTooltip key={f} content={`Show ${f} tasks`}>
            <Button
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          </HoverTooltip>
        ))}
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className={`transition-opacity ${task.completed ? 'opacity-60' : ''}`}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <HoverTooltip content="Mark this task as complete or incomplete">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                      task.completed
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {task.completed && <CheckSquare className="h-4 w-4" />}
                  </button>
                </HoverTooltip>
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    {task.dueDate && (
                      <span
                        className={`flex items-center gap-1 ${
                          isOverdue(task) ? 'text-red-500' : ''
                        }`}
                      >
                        <Calendar className="h-3 w-3" />
                        {isOverdue(task) ? 'Overdue: ' : ''}
                        {formatRelativeDate(task.dueDate)}
                      </span>
                    )}
                    <span
                      className={`rounded px-2 py-0.5 ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                    {task.deal && <span>{task.deal.title}</span>}
                  </div>
                </div>
                <HoverTooltip content="Permanently delete this task">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </HoverTooltip>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open)
        if (!open) setErrors({})
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task in your list</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as 'low' | 'medium' | 'high',
                    })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <HoverTooltip content="Save this task after filling required fields">
              <Button type="submit">Create Task</Button>
            </HoverTooltip>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
