import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL').optional(),
})

export function validateEnv() {
  try {
    const result = envSchema.safeParse(process.env)
    
    if (!result.success) {
      const errors = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('\n')
      throw new Error(`Environment validation failed:\n${errors}`)
    }
    
    return result.data
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    throw error
  }
}

export const env = validateEnv()
