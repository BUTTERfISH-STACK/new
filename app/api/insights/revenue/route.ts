import { NextResponse } from 'next/server'
import { isFeatureEnabled } from '@/lib/featureFlags'
import { getRevenueIntelligence, getSalesInsights } from '@/features/advanced/revenueIntelligence/service'

export async function GET() {
  try {
    if (!isFeatureEnabled('ENABLE_REVENUE_INTELLIGENCE')) {
      return NextResponse.json(
        { error: 'Revenue Intelligence is not enabled' },
        { status: 403 }
      )
    }

    const [metrics, insights] = await Promise.all([
      getRevenueIntelligence(),
      getSalesInsights()
    ])

    return NextResponse.json({
      metrics,
      insights
    })
  } catch (error) {
    console.error('Error fetching revenue intelligence:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue intelligence' },
      { status: 500 }
    )
  }
}
