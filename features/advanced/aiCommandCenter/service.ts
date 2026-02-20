/**
 * AI Command Center Service
 * 
 * Rule-based AI calculations for deal insights.
 * This is a foundation for future AI integration.
 */

import prisma from '@/lib/prisma'
import type {
  AICommandCenterData,
  DealRisk,
  SuggestedAction,
  RevenueForecast,
  CloseProbabilityEstimate,
  PriorityDeal
} from './types'

// Configuration constants
const INACTIVITY_THRESHOLD_DAYS = 14
const HIGH_RISK_DAYS = 21
const MEDIUM_RISK_DAYS = 14

/**
 * Calculate days since last activity
 */
async function getDaysSinceLastActivity(dealId: string): Promise<number> {
  const latestActivity = await prisma.activity.findFirst({
    where: { dealId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true }
  })

  if (!latestActivity) {
    // If no activity, check deal creation date
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      select: { createdAt: true }
    })
    if (!deal) return 999
    const diff = Date.now() - deal.createdAt.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const diff = Date.now() - latestActivity.createdAt.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Determine risk level based on inactivity
 */
function calculateRiskLevel(daysSinceActivity: number): 'high' | 'medium' | 'low' {
  if (daysSinceActivity >= HIGH_RISK_DAYS) return 'high'
  if (daysSinceActivity >= MEDIUM_RISK_DAYS) return 'medium'
  return 'low'
}

/**
 * Get deals at risk based on inactivity
 */
async function getDealsAtRisk(): Promise<DealRisk[]> {
  const deals = await prisma.deal.findMany({
    where: {
      stage: {
        notIn: ['CLOSED_WON', 'CLOSED_LOST']
      }
    },
    include: {
      company: true,
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  const atRiskDeals: DealRisk[] = []

  for (const deal of deals) {
    const daysSinceActivity = await getDaysSinceLastActivity(deal.id)
    
    if (daysSinceActivity >= MEDIUM_RISK_DAYS) {
      const riskFactors: string[] = []
      
      if (daysSinceActivity >= HIGH_RISK_DAYS) {
        riskFactors.push('No activity for 21+ days')
      } else if (daysSinceActivity >= MEDIUM_RISK_DAYS) {
        riskFactors.push('No activity for 14+ days')
      }

      // Add other risk factors
      if (deal.probability < 30) {
        riskFactors.push('Low win probability')
      }
      if (deal.value > 50000) {
        riskFactors.push('High-value deal needs attention')
      }

      atRiskDeals.push({
        dealId: deal.id,
        dealTitle: deal.title,
        companyName: deal.company?.name || 'No company',
        value: deal.value,
        daysSinceLastActivity: daysSinceActivity,
        riskLevel: calculateRiskLevel(daysSinceActivity),
        riskFactors
      })
    }
  }

  // Sort by value descending
  return atRiskDeals.sort((a, b) => b.value - a.value)
}

/**
 * Generate suggested next actions based on deal stage and activity
 */
async function getSuggestedActions(): Promise<SuggestedAction[]> {
  const deals = await prisma.deal.findMany({
    where: {
      stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] }
    },
    include: {
      company: true,
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    }
  })

  const suggestions: SuggestedAction[] = []

  for (const deal of deals) {
    const daysSinceActivity = await getDaysSinceLastActivity(deal.id)
    const lastActivity = deal.activities[0]

    // Stage-based suggestions
    let actionType: SuggestedAction['actionType'] = 'follow_up'
    let reason = ''
    let priority: SuggestedAction['priority'] = 'medium'

    switch (deal.stage) {
      case 'LEAD':
        actionType = 'call'
        reason = 'New lead needs initial outreach'
        priority = 'high'
        break
      case 'QUALIFIED':
        actionType = 'email'
        reason = 'Send qualification follow-up'
        priority = 'high'
        break
      case 'PROPOSAL':
        actionType = 'meeting'
        reason = 'Schedule proposal review meeting'
        priority = 'high'
        break
      case 'NEGOTIATION':
        actionType = 'negotiation'
        reason = 'Follow up on negotiation'
        priority = 'high'
        break
      default:
        reason = 'Review deal status'
    }

    // Override if inactive
    if (daysSinceActivity >= MEDIUM_RISK_DAYS) {
      actionType = 'follow_up'
      reason = `Deal inactive for ${daysSinceActivity} days`
      priority = 'high'
    }

    // Check if recently contacted
    if (lastActivity) {
      const hoursSinceLastActivity = (Date.now() - lastActivity.createdAt.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastActivity < 48) {
        continue // Skip if recently contacted
      }
    }

    suggestions.push({
      dealId: deal.id,
      dealTitle: deal.title,
      actionType,
      priority,
      reason,
      suggestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
    })
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

/**
 * Calculate revenue forecast
 */
async function getRevenueForecast(): Promise<RevenueForecast> {
  const deals = await prisma.deal.findMany({
    where: {
      stage: { notIn: ['CLOSED_LOST'] }
    }
  })

  // Calculate weighted forecast
  let predictedRevenue = 0
  let bestCase = 0
  let conservative = 0

  for (const deal of deals) {
    const weighted = deal.value * (deal.probability / 100)
    predictedRevenue += weighted
    
    bestCase += deal.value
    conservative += deal.value * 0.5
  }

  // Get closed won for confidence calculation
  const closedWon = await prisma.deal.findMany({
    where: { stage: 'CLOSED_WON' }
  })

  const wonCount = closedWon.length
  const totalClosed = wonCount + (await prisma.deal.count({ where: { stage: 'CLOSED_LOST' } }))
  const confidence = totalClosed > 0 ? (wonCount / totalClosed) * 100 : 50

  // Generate forecast by month (next 6 months)
  const forecastByMonth = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const month = new Date(now.getFullYear(), now.getMonth() + i, 1)
    forecastByMonth.push({
      month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      predicted: Math.round(predictedRevenue / 6)
    })
  }

  return {
    predictedRevenue: Math.round(predictedRevenue),
    confidence: Math.round(confidence),
    bestCase: Math.round(bestCase),
    worstCase: Math.round(conservative),
    conservative: Math.round(conservative),
    forecastByMonth
  }
}

/**
 * Calculate close probability for each deal
 */
async function getCloseProbabilities(): Promise<CloseProbabilityEstimate[]> {
  const deals = await prisma.deal.findMany({
    where: {
      stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] }
    },
    include: {
      company: true,
      _count: {
        select: {
          activities: true,
          tasks: true
        }
      }
    }
  })

  const probabilities: CloseProbabilityEstimate[] = []

  for (const deal of deals) {
    const factors: CloseProbabilityEstimate['factors'] = []
    let baseProbability = deal.probability

    // Factor: Number of activities (more = higher chance)
    const activityCount = deal._count.activities
    if (activityCount > 10) {
      factors.push({
        name: 'High Activity',
        impact: 0.15,
        description: `${activityCount} activities logged`
      })
      baseProbability = Math.min(100, baseProbability + 15)
    } else if (activityCount < 3) {
      factors.push({
        name: 'Low Activity',
        impact: -0.15,
        description: `Only ${activityCount} activities logged`
      })
      baseProbability = Math.max(0, baseProbability - 15)
    }

    // Factor: Has company
    if (deal.companyId) {
      factors.push({
        name: 'Company Linked',
        impact: 0.1,
        description: 'Deal has associated company'
      })
      baseProbability = Math.min(100, baseProbability + 10)
    }

    // Factor: Has contact
    if (deal.contactId) {
      factors.push({
        name: 'Contact Linked',
        impact: 0.1,
        description: 'Deal has decision maker'
      })
      baseProbability = Math.min(100, baseProbability + 10)
    }

    // Factor: Stage progression
    const stageProgress: Record<string, number> = {
      'LEAD': 0.1,
      'QUALIFIED': 0.3,
      'PROPOSAL': 0.5,
      'NEGOTIATION': 0.7
    }
    if (stageProgress[deal.stage]) {
      factors.push({
        name: 'Stage Progress',
        impact: stageProgress[deal.stage] - (deal.probability / 100),
        description: `Deal in ${deal.stage} stage`
      })
    }

    probabilities.push({
      dealId: deal.id,
      probability: Math.round(baseProbability),
      factors
    })
  }

  return probabilities.sort((a, b) => b.probability - a.probability)
}

/**
 * Get priority deals ranked by score
 */
async function getPriorityDeals(): Promise<PriorityDeal[]> {
  const deals = await prisma.deal.findMany({
    where: {
      stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] }
    },
    include: {
      company: true,
      _count: {
        select: {
          activities: true,
          tasks: true
        }
      }
    }
  })

  const scoredDeals: PriorityDeal[] = []

  for (const deal of deals) {
    let score = 0
    const reasons: string[] = []

    // Value score (0-40 points)
    const valueScore = Math.min(40, (deal.value / 10000) * 20)
    score += valueScore
    if (valueScore > 20) reasons.push('High value deal')

    // Probability score (0-30 points)
    const probScore = (deal.probability / 100) * 30
    score += probScore
    if (deal.probability > 60) reasons.push('High win probability')

    // Activity score (0-20 points)
    const activityScore = Math.min(20, deal._count.activities * 2)
    score += activityScore
    if (deal._count.activities > 10) reasons.push('Strong engagement')

    // Recency score (0-10 points)
    const daysSinceActivity = await getDaysSinceLastActivity(deal.id)
    const recencyScore = Math.max(0, 10 - (daysSinceActivity / 3))
    score += recencyScore
    if (daysSinceActivity < 7) reasons.push('Recently active')

    scoredDeals.push({
      dealId: deal.id,
      dealTitle: deal.title,
      companyName: deal.company?.name || 'No company',
      value: deal.value,
      stage: deal.stage,
      score: Math.round(score),
      reasons
    })
  }

  return scoredDeals.sort((a, b) => b.score - a.score).slice(0, 10)
}

/**
 * Main function to get all AI Command Center data
 */
export async function getAICommandCenterData(): Promise<AICommandCenterData> {
  const [
    dealsAtRisk,
    suggestedActions,
    revenueForecast,
    closeProbabilities,
    priorityDeals
  ] = await Promise.all([
    getDealsAtRisk(),
    getSuggestedActions(),
    getRevenueForecast(),
    getCloseProbabilities(),
    getPriorityDeals()
  ])

  // Calculate summary
  const allDeals = await prisma.deal.findMany({
    where: { stage: { notIn: ['CLOSED_LOST'] } }
  })

  const highRiskCount = dealsAtRisk.filter(d => d.riskLevel === 'high').length
  const avgProbability = closeProbabilities.length > 0
    ? closeProbabilities.reduce((sum, p) => sum + p.probability, 0) / closeProbabilities.length
    : 0

  return {
    dealsAtRisk,
    suggestedActions,
    revenueForecast,
    closeProbabilities,
    priorityDeals,
    summary: {
      totalDealsAnalyzed: allDeals.length,
      highRiskDeals: highRiskCount,
      avgCloseProbability: Math.round(avgProbability),
      predictedRevenue: revenueForecast.predictedRevenue
    }
  }
}

export default getAICommandCenterData
