import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const dealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.number().min(0, 'Value must be positive'),
  currency: z.string().optional(),
  stage: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']),
  probability: z.number().min(0).max(100),
  expectedCloseDate: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stage = searchParams.get('stage')
    const companyId = searchParams.get('companyId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}

    if (stage) {
      where.stage = stage
    }

    if (companyId) {
      where.companyId = companyId
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          company: true,
          contact: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.deal.count({ where }),
    ])

    return NextResponse.json({
      data: deals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[API /deals] Received request body:', JSON.stringify(body))
    
    const validatedData = dealSchema.parse(body)
    console.log('[API /deals] Validation passed, creating deal with:', JSON.stringify(validatedData))

    const deal = await prisma.deal.create({
      data: {
        title: validatedData.title,
        value: validatedData.value,
        currency: validatedData.currency || 'USD',
        stage: validatedData.stage,
        probability: validatedData.probability,
        expectedCloseDate: validatedData.expectedCloseDate 
          ? new Date(validatedData.expectedCloseDate) 
          : null,
        companyId: validatedData.companyId,
        contactId: validatedData.contactId,
        notes: validatedData.notes,
      },
      include: {
        company: true,
        contact: true,
      },
    })

    console.log('[API /deals] Deal created successfully:', JSON.stringify(deal))
    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[API /deals] Validation error:', JSON.stringify(error.errors))
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[API /deals] Error creating deal:', error)
    return NextResponse.json(
      { error: 'Failed to create deal', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
