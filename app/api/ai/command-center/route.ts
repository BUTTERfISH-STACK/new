import { NextResponse } from 'next/server'
import { isFeatureEnabled } from '@/lib/featureFlags'
import { getAICommandCenterData } from '@/features/advanced/aiCommandCenter/service'

export async function GET() {
  try {
    // Check if feature is enabled
    if (!isFeatureEnabled('ENABLE_AI_COMMAND_CENTER')) {
      return NextResponse.json(
        { error: 'AI Command Center is not enabled' },
        { status: 403 }
      )
    }

    const data = await getAICommandCenterData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching AI Command Center data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI insights' },
      { status: 500 }
    )
  }
}
