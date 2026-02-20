/**
 * AI Command Center Types
 */

export interface DealRisk {
  dealId: string
  dealTitle: string
  companyName: string
  value: number
  daysSinceLastActivity: number
  riskLevel: 'high' | 'medium' | 'low'
  riskFactors: string[]
}

export interface SuggestedAction {
  dealId: string
  dealTitle: string
  actionType: 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'negotiation'
  priority: 'high' | 'medium' | 'low'
  reason: string
  suggestedDate?: Date
}

export interface RevenueForecast {
  predictedRevenue: number
  confidence: number
  bestCase: number
  worstCase: number
  conservative: number
  forecastByMonth: {
    month: string
    predicted: number
    actual?: number
  }[]
}

export interface CloseProbabilityEstimate {
  dealId: string
  probability: number
  factors: {
    name: string
    impact: number // -1 to 1
    description: string
  }[]
}

export interface PriorityDeal {
  dealId: string
  dealTitle: string
  companyName: string
  value: number
  stage: string
  score: number
  reasons: string[]
}

export interface AICommandCenterData {
  dealsAtRisk: DealRisk[]
  suggestedActions: SuggestedAction[]
  revenueForecast: RevenueForecast
  closeProbabilities: CloseProbabilityEstimate[]
  priorityDeals: PriorityDeal[]
  summary: {
    totalDealsAnalyzed: number
    highRiskDeals: number
    avgCloseProbability: number
    predictedRevenue: number
  }
}
