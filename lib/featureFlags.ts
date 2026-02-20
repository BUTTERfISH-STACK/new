/**
 * Feature Flag Configuration
 * 
 * All features can be toggled via environment variables or this config.
 * Use this to enable/disable features without deploying.
 */

export interface FeatureFlags {
  ENABLE_AI_COMMAND_CENTER: boolean
  ENABLE_REVENUE_INTELLIGENCE: boolean
  ENABLE_AUTOMATION_ENGINE: boolean
  ENABLE_MOMENTUM_SCORE: boolean
  ENABLE_SALES_COPILOT: boolean
  ENABLE_REALTIME_COLLAB: boolean
  ENABLE_GAMIFICATION: boolean
  ENABLE_DATA_ENRICHMENT: boolean
  ENABLE_ADVANCED_ANALYTICS: boolean
  ENABLE_MULTI_TENANT: boolean
  ENABLE_COMMUNICATION_LAYER: boolean
  ENABLE_VERTICAL_MODE: boolean
  ENABLE_FORECASTING: boolean
  ENABLE_DEAL_TIMELINE: boolean
}

// Default feature flags - all disabled by default for stability
const defaultFlags: FeatureFlags = {
  ENABLE_AI_COMMAND_CENTER: false,
  ENABLE_REVENUE_INTELLIGENCE: false,
  ENABLE_AUTOMATION_ENGINE: false,
  ENABLE_MOMENTUM_SCORE: false,
  ENABLE_SALES_COPILOT: false,
  ENABLE_REALTIME_COLLAB: false,
  ENABLE_GAMIFICATION: false,
  ENABLE_DATA_ENRICHMENT: false,
  ENABLE_ADVANCED_ANALYTICS: false,
  ENABLE_MULTI_TENANT: false,
  ENABLE_COMMUNICATION_LAYER: false,
  ENABLE_VERTICAL_MODE: false,
  ENABLE_FORECASTING: false,
  ENABLE_DEAL_TIMELINE: false,
}

/**
 * Get feature flags from environment variables
 * Format: NEXT_PUBLIC_FEATURE_NAME=true
 */
export function getFeatureFlags(): FeatureFlags {
  const flags: FeatureFlags = { ...defaultFlags }
  
  // Map environment variables to feature flags
  const envFlags: (keyof FeatureFlags)[] = [
    'ENABLE_AI_COMMAND_CENTER',
    'ENABLE_REVENUE_INTELLIGENCE',
    'ENABLE_AUTOMATION_ENGINE',
    'ENABLE_MOMENTUM_SCORE',
    'ENABLE_SALES_COPILOT',
    'ENABLE_REALTIME_COLLAB',
    'ENABLE_GAMIFICATION',
    'ENABLE_DATA_ENRICHMENT',
    'ENABLE_ADVANCED_ANALYTICS',
    'ENABLE_MULTI_TENANT',
    'ENABLE_COMMUNICATION_LAYER',
    'ENABLE_VERTICAL_MODE',
    'ENABLE_FORECASTING',
    'ENABLE_DEAL_TIMELINE',
  ]
  
  for (const flag of envFlags) {
    const envVar = `NEXT_PUBLIC_${flag}`
    if (process.env[envVar] === 'true') {
      flags[flag] = true
    }
  }
  
  return flags
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags()
  return flags[flag]
}

/**
 * Feature flag helper for React components
 * Usage: const { isEnabled } = useFeatureFlags()
 */
export const featureFlags = typeof window !== 'undefined' 
  ? getFeatureFlags()
  : defaultFlags
