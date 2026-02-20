/**
 * Revenue Intelligence Service
 * 
 * Provides analytics and insights for sales performance.
 */

import prisma from '@/lib/prisma'
import type { DealStage } from '@/types'

export interface RevenueMetrics {
  averageSalesCycle: number // in days
  winRateByUser: Record<string, number>
  winRateByIndustry: Record<string, number>
  lostReasonClustering: {
    reason: string
    count: number
    percentage: number
  }[]
}

export interface SalesInsight {
  id: string
  type: 'positive' | 'negative' | 'neutral'
  title: string
  description: string
  metric?: string
  change?: number
}

/**
 * Calculate average sales cycle (days from creation to close)
 */
async function calculateAverageSalesCycle(): Promise<number> {
  const closedDeals = await prisma.deal.findMany({
    where: {
      stage: { in: ['CLOSED_WON', 'CLOSED_LOST'] }
    },
    select: {
      createdAt: true,
      updatedAt: true
    }
  })

  if (closedDeals.length === 0) return 0

  const totalDays = closedDeals.reduce((sum, deal) => {
    const days = (deal.updatedAt.getTime() - deal.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return sum + days
  }, 0)

  return Math.round(totalDays / closedDeals.length)
}

/**
 * Calculate win rate by company industry
 */
async function calculateWinRateByIndustry(): Promise<Record<string, number>> {
  const deals = await prisma.deal.findMany({
    where: {
      stage: { in: ['CLOSED_WON', 'CLOSED_LOST'] }
    },
    include: {
      company: true
    }
  })

  const industryStats: Record<string, { won: number; lost: number }> = {}

  for (const deal of deals) {
    const industry = deal.company?.industry || 'Unknown'
    if (!industryStats[industry]) {
      industryStats[industry] = { won: 0, lost: 0 }
    }
    if (deal.stage === 'CLOSED_WON') {
      industryStats[industry].won++
    } else {
      industryStats[industry].lost++
    }
  }

  const winRates: Record<string, number> = {}
  for (const [industry, stats] of Object.entries(industryStats)) {
    const total = stats.won + stats.lost
    winRates[industry] = total > 0 ? Math.round((stats.won / total) * 100) : 0
  }

  return winRates
}

/**
 * Cluster lost deals by reason (basic grouping)
 */
async function clusterLostReasons(): Promise<RevenueMetrics['lostReasonClustering']> {
  // In a real implementation, this would analyze deal notes/activities
  // For now, we'll return placeholder data based on activity analysis
  
  const lostDeals = await prisma.deal.findMany({
    where: { stage: 'CLOSED_LOST' },
    include: {
      activities: true
    }
  })

  const reasons = [
    { reason: 'No response', count: 0 },
    { reason: 'Price too high', count: 0 },
    { reason: 'Lost to competitor', count: 0 },
    { reason: 'Changed priorities', count: 0 },
    { reason: 'Timeline mismatch', count: 0 },
  ]

  // Basic clustering based on activity count
  for (const deal of lostDeals) {
    const activityCount = deal.activities.length
    if (activityCount === 0) {
      reasons[0].count++ // No response
    } else if (activityCount < 3) {
      reasons[3].count++ // Changed priorities
    } else {
      reasons[4].count++ // Timeline mismatch (default)
    }
  }

  const total = lostDeals.length || 1
  return reasons.map(r => ({
    ...r,
    percentage: Math.round((r.count / total) * 100)
  }))
}

/**
 * Get all revenue intelligence metrics
 */
export async function getRevenueIntelligence(): Promise<RevenueMetrics> {
  const [
    averageSalesCycle,
    winRateByIndustry,
    lostReasonClustering
  ] = await Promise.all([
    calculateAverageSalesCycle(),
    calculateWinRateByIndustry(),
    clusterLostReasons()
  ])

  return {
    averageSalesCycle,
    winRateByUser: {}, // Would require user tracking
    winRateByIndustry,
    lostReasonClustering
  }
}

/**
 * Get sales insights
 */
export async function getSalesInsights(): Promise<SalesInsight[]> {
  const insights: SalesInsight[] = []

  // Get overall stats
  const [totalDeals, wonDeals, lostDeals] = await Promise.all([
    prisma.deal.count({ where: { stage: { notIn: ['CLOSED_LOST'] } } }),
    prisma.deal.count({ where: { stage: 'CLOSED_WON' } }),
    prisma.deal.count({ where: { stage: 'CLOSED_LOST' } })
  ])

  const winRate = totalDeals > 0 ? Math.round((wonDeals / (wonDeals + lostDeals)) * 100) : 0

  if (winRate > 50) {
    insights.push({
      id: '1',
      type: 'positive',
      title: 'Strong Win Rate',
      description: `Your win rate is ${winRate}%, which is above average.`,
      metric: 'winRate',
      change: winRate
    })
  }

  // Check for deals stuck in stages
  const oldDeals = await prisma.deal.findMany({
    where: {
      stage: { in: ['LEAD', 'QUALIFIED'] },
      createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  })

  if (oldDeals.length > 5) {
    insights.push({
      id: '2',
      type: 'negative',
      title: 'Stale Leads',
      description: `You have ${oldDeals.length} leads older than 30 days that need attention.`,
      metric: 'staleLeads',
      change: oldDeals.length
    })
  }

  // Check for high-value deals at risk
  const highValueDeals = await prisma.deal.findMany({
    where: {
      value: { gte: 50000 },
      stage: { in: ['LEAD', 'QUALIFIED', 'PROPOSAL'] }
    }
  })

  if (highValueDeals.length > 0) {
    insights.push({
      id: '3',
      type: 'neutral',
      title: 'High-Value Opportunities',
      description: `You have ${highValueDeals.length} deals worth over $50K that need focus.`,
      metric: 'highValueDeals',
      change: highValueDeals.length
    })
  }

  return insights
}

export default getRevenueIntelligence
