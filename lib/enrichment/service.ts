/**
 * Data Enrichment Service
 * 
 * Auto-tags and enriches company and deal data based on rules.
 */

import prisma from '@/lib/prisma'

// Industry keywords for auto-tagging
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  'Technology': ['tech', 'software', 'saas', 'cloud', 'ai', 'data', 'digital', 'cyber'],
  'Finance': ['bank', 'finance', 'investment', 'capital', 'insurance', 'fintech'],
  'Healthcare': ['health', 'medical', 'hospital', 'pharma', 'biotech', 'wellness'],
  'Retail': ['retail', 'shop', 'store', 'e-commerce', 'commerce', 'brand'],
  'Manufacturing': ['manufacturing', 'factory', 'production', 'industrial', 'assembly'],
  'Education': ['education', 'school', 'university', 'training', 'learning', 'edtech'],
  'Real Estate': ['real estate', 'property', 'realty', 'housing', 'construction'],
  'Marketing': ['marketing', 'advertising', 'agency', 'media', 'creative'],
  'Consulting': ['consulting', 'advisory', 'services', 'solutions'],
  'Logistics': ['logistics', 'shipping', 'transport', 'delivery', 'supply chain'],
}

// Company size buckets based on keywords in description
const COMPANY_SIZE_KEYWORDS: Record<string, string[]> = {
  '1-10': ['startup', 'bootstrapped', 'founder', 'small team'],
  '11-50': ['growing', 'scaling', 'team of', 'employees'],
  '51-200': ['established', 'mid-size', 'enterprise'],
  '201-1000': ['large', 'major', 'global'],
  '1000+': ['fortune', 'enterprise', 'corporation', 'large corporation'],
}

/**
 * Auto-tag industry based on company website/description
 */
export async function enrichCompanyIndustry(companyId: string): Promise<void> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  })

  if (!company) return

  const searchText = `${company.name} ${company.industry || ''} ${company.website || ''}`.toLowerCase()

  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        // Only update if industry is not already set
        if (!company.industry) {
          await prisma.company.update({
            where: { id: companyId },
            data: { industry },
          })
        }
        return
      }
    }
  }
}

/**
 * Auto-suggest deal probability based on industry win rates
 */
export async function suggestDealProbability(dealId: string): Promise<number | null> {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { company: true },
  })

  if (!deal || !deal.company?.industry) return null

  // Calculate win rate for this industry
  const industryDeals = await prisma.deal.findMany({
    where: {
      company: { industry: deal.company.industry },
      stage: { in: ['CLOSED_WON', 'CLOSED_LOST'] },
    },
  })

  if (industryDeals.length < 3) return null // Need minimum data

  const wonDeals = industryDeals.filter(d => d.stage === 'CLOSED_WON').length
  const winRate = wonDeals / industryDeals.length

  // Return suggested probability (could be different from current)
  return Math.round(winRate * 100)
}

/**
 * Auto-generate company size bucket
 */
export async function enrichCompanySize(companyId: string): Promise<void> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  })

  if (!company) return

  const searchText = `${company.name} ${company.industry || ''}`.toLowerCase()

  for (const [size, keywords] of Object.entries(COMPANY_SIZE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        // Could store in a custom field, for now just log
        console.log(`Company ${company.name} likely size: ${size}`)
        return
      }
    }
  }
}

/**
 * Enrich a company on creation
 */
export async function enrichCompany(companyId: string): Promise<void> {
  await Promise.all([
    enrichCompanyIndustry(companyId),
    enrichCompanySize(companyId),
  ])
}

/**
 * Run enrichment on all existing companies without industry
 */
export async function enrichAllCompanies(): Promise<number> {
  const companies = await prisma.company.findMany({
    where: { industry: null },
    select: { id: true },
  })

  for (const company of companies) {
    await enrichCompanyIndustry(company.id)
  }

  return companies.length
}
