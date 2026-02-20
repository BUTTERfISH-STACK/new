'use client'

import { useEffect, useState, Suspense } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { isFeatureEnabled } from '@/lib/featureFlags'
import { AiCommandCenter } from '@/features/advanced/aiCommandCenter/AiCommandCenter'
import {
  DollarSign,
  Briefcase,
  Users,
  CheckSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Inbox,
  Plus,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface DashboardData {
  stats: {
    totalDeals: number
    totalValue: number
    forecast: number
    wonValue: number
    dealsByStage: Record<string, number>
    valueByStage: Record<string, number>
    companiesCount: number
    contactsCount: number
    tasksCount: number
  }
  tasksDueToday: Array<{
    id: string
    title: string
    dueDate: string | null
    deal: { title: string } | null
  }>
  recentActivities: Array<{
    id: string
    type: string
    description: string
    createdAt: string
    deal: { title: string } | null
  }>
}

const STAGE_COLORS = {
  LEAD: '#94a3b8',
  QUALIFIED: '#60a5fa',
  PROPOSAL: '#a78bfa',
  NEGOTIATION: '#f472b6',
  CLOSED_WON: '#22c55e',
  CLOSED_LOST: '#ef4444',
}

const STAGE_LABELS: Record<string, string> = {
  LEAD: 'Lead',
  QUALIFIED: 'Qualified',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
}

// Inner component that fetches data
function DashboardContent() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        setError('Failed to load dashboard data')
      }
    } catch (err) {
      console.error('Failed to fetch dashboard:', err)
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your sales pipeline</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">{error || 'No data available'}</p>
          <Button onClick={fetchDashboard}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const { stats } = data
  
  // Check if there's any data
  const hasData = stats.totalDeals > 0 || 
                  stats.companiesCount > 0 || 
                  stats.contactsCount > 0 || 
                  stats.tasksCount > 0

  const pipelineData = Object.entries(stats.dealsByStage).map(([stage, count]) => ({
    stage: STAGE_LABELS[stage] || stage,
    count,
    value: stats.valueByStage[stage],
  }))

  const totalValue = stats.totalValue || 1
  const valueDistribution = Object.entries(stats.valueByStage).map(([stage, value]) => ({
    name: STAGE_LABELS[stage] || stage,
    value: (value / totalValue) * 100,
    amount: value,
  })).filter(item => item.amount > 0)

  // Calculate conversion metrics
  const totalClosed = (stats.dealsByStage['CLOSED_WON'] || 0) + (stats.dealsByStage['CLOSED_LOST'] || 0)
  const winRate = totalClosed > 0 ? Math.round((stats.dealsByStage['CLOSED_WON'] || 0) / totalClosed * 100) : 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your sales pipeline</p>
        </div>
        <Button variant="outline" onClick={fetchDashboard}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="flex flex-col items-center justify-center h-96 gap-4 mb-8">
          <div className="rounded-full bg-muted p-6">
            <Inbox className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No Data Yet</h2>
            <p className="text-muted-foreground mb-4">Start by creating your first deal to see analytics</p>
            <Button onClick={() => router.push('/pipeline')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Deal
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {hasData && (
        <>
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalDeals} active deals
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Forecast</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.forecast)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    Weighted probability
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Won Revenue</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.wonValue)}</div>
                <p className="text-xs text-muted-foreground">
                  {winRate}% win rate
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tasksCount}</div>
                <p className="text-xs text-muted-foreground">
                  {data.tasksDueToday.length} due today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            {/* Deals by Stage */}
            <Card>
              <CardHeader>
                <CardTitle>Deals by Stage</CardTitle>
                <CardDescription>Number of deals in each pipeline stage</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="stage" 
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Value Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Value Distribution</CardTitle>
                <CardDescription>Value distribution across stages</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {valueDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={valueDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {valueDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={Object.values(STAGE_COLORS)[index % Object.values(STAGE_COLORS).length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value, name, props) => [
                          formatCurrency(props?.payload?.amount || 0),
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No deal values to display
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Tasks Due Today */}
            <Card>
              <CardHeader>
                <CardTitle>Tasks Due Today</CardTitle>
                <CardDescription>Your pending tasks for today</CardDescription>
              </CardHeader>
              <CardContent>
                {data.tasksDueToday.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks due today</p>
                ) : (
                  <div className="space-y-3">
                    {data.tasksDueToday.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          {task.deal && (
                            <p className="text-xs text-muted-foreground">
                              {task.deal.title}
                            </p>
                          )}
                        </div>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates in your pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                {data.recentActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {data.recentActivities.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 rounded-lg border p-3"
                      >
                        <div className="rounded-full bg-primary/10 p-2">
                          {activity.type === 'CALL' && (
                            <Users className="h-4 w-4 text-primary" />
                          )}
                          {activity.type === 'EMAIL' && (
                            <Briefcase className="h-4 w-4 text-primary" />
                          )}
                          {activity.type === 'MEETING' && (
                            <Users className="h-4 w-4 text-primary" />
                          )}
                          {activity.type === 'NOTE' && (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm">{activity.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {activity.deal && <span>{activity.deal.title}</span>}
                            <span>•</span>
                            <span>
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* AI Command Center - Conditionally rendered */}
      {isFeatureEnabled('ENABLE_AI_COMMAND_CENTER') && (
        <div className="mt-8">
          <AiCommandCenter />
        </div>
      )}
    </div>
  )
}

// Loading component
function DashboardLoading() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}

// Main page with Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}
