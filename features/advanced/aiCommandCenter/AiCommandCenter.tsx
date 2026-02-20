'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Zap, 
  Phone, 
  Mail, 
  Users, 
  FileText,
  ArrowRight,
  DollarSign,
  Activity
} from 'lucide-react'
import type { AICommandCenterData } from './types'

const actionIcons: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  follow_up: Activity,
  proposal: FileText,
  negotiation: Zap
}

const riskColors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200'
}

export function AiCommandCenter() {
  const [data, setData] = useState<AICommandCenterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ai/command-center')
      if (!res.ok) {
        throw new Error('Failed to fetch AI data')
      }
      const jsonData = await res.json()
      setData(jsonData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            AI Command Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-20 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return null // Don't render if feature is disabled or error
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deals Analyzed</p>
                <p className="text-2xl font-bold">{data.summary.totalDealsAnalyzed}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{data.summary.highRiskDeals}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Close Rate</p>
                <p className="text-2xl font-bold">{data.summary.avgCloseProbability}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Predicted Revenue</p>
                <p className="text-2xl font-bold">${data.summary.predictedRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Best Case</p>
              <p className="text-xl font-bold text-green-700">
                ${data.revenueForecast.bestCase.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Predicted</p>
              <p className="text-xl font-bold text-blue-700">
                ${data.revenueForecast.predictedRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Conservative</p>
              <p className="text-xl font-bold text-gray-700">
                ${data.revenueForecast.conservative.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Confidence: {data.revenueForecast.confidence}%</span>
            <span>Based on {data.revenueForecast.forecastByMonth.length} month projection</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deals at Risk */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Deals at Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.dealsAtRisk.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No deals at risk</p>
            ) : (
              <div className="space-y-3">
                {data.dealsAtRisk.slice(0, 5).map((deal) => (
                  <div
                    key={deal.dealId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{deal.dealTitle}</p>
                      <p className="text-sm text-muted-foreground">{deal.companyName}</p>
                      <p className="text-xs text-muted-foreground">
                        {deal.daysSinceLastActivity} days inactive
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${deal.value.toLocaleString()}</p>
                      <Badge className={riskColors[deal.riskLevel]}>
                        {deal.riskLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggested Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Suggested Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.suggestedActions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No actions suggested</p>
            ) : (
              <div className="space-y-3">
                {data.suggestedActions.slice(0, 5).map((action, idx) => {
                  const Icon = actionIcons[action.actionType] || Activity
                  return (
                    <div
                      key={`${action.dealId}-${idx}`}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <div className={`p-2 rounded-full ${
                        action.priority === 'high' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          action.priority === 'high' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{action.dealTitle}</p>
                        <p className="text-sm text-muted-foreground">{action.reason}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Priority Deals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Priority Deals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.priorityDeals.map((deal, idx) => (
              <div
                key={deal.dealId}
                className="flex items-center gap-4 p-3 border rounded-lg"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                  idx === 1 ? 'bg-gray-100 text-gray-700' :
                  idx === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{deal.dealTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {deal.companyName} • {deal.stage}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${deal.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Score: {deal.score}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AiCommandCenter
