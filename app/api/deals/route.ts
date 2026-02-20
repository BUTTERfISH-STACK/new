import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { DealStage } from '@prisma/client'

const dealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.number().min(0, 'Value must be positive'),
  stage: z.nativeEnum(DealStage),
  probability: z.number().min(0).max(100),
  expectedCloseDate: z.string().optional(),
  companyId: z.string().optional(),
  contactId: z.string().optional(),
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
    const validatedData = dealSchema.parse(body)

    const deal = await prisma.deal.create({
      data: {
        ...validatedData,
        expectedCloseDate: validatedData.expectedCloseDate 
          ? new Date(validatedData.expectedCloseDate) 
          : null,
        companyId: validatedData.companyId || null,
        contactId: validatedData.contactId || null,
      },
      include: {
        company: true,
        contact: true,
      },
    })

    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating deal:', error)
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    )
  }
}
