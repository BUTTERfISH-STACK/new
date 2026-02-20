import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { isFeatureEnabled } from '@/lib/featureFlags'

const callLogSchema = z.object({
  subject: z.string().optional(),
  duration: z.number().min(0),
  direction: z.enum(['inbound', 'outbound']),
  status: z.enum(['completed', 'missed', 'voicemail', 'failed']).optional(),
  notes: z.string().optional(),
  callAt: z.string().transform(str => new Date(str)),
  dealId: z.string().optional(),
  companyId: z.string().optional(),
  contactId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    if (!isFeatureEnabled('ENABLE_COMMUNICATION_LAYER')) {
      return NextResponse.json(
        { error: 'Communication layer is not enabled' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const dealId = searchParams.get('dealId')
    const companyId = searchParams.get('companyId')
    const contactId = searchParams.get('contactId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (dealId) where.dealId = dealId
    if (companyId) where.companyId = companyId
    if (contactId) where.contactId = contactId

    const [calls, total] = await Promise.all([
      prisma.callLog.findMany({
        where,
        include: {
          deal: { select: { id: true, title: true } },
          company: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { callAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.callLog.count({ where }),
    ])

    return NextResponse.json({
      data: calls,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching calls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isFeatureEnabled('ENABLE_COMMUNICATION_LAYER')) {
      return NextResponse.json(
        { error: 'Communication layer is not enabled' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = callLogSchema.parse(body)

    const call = await prisma.callLog.create({
      data: {
        subject: validatedData.subject,
        duration: validatedData.duration,
        direction: validatedData.direction,
        status: validatedData.status || 'completed',
        notes: validatedData.notes,
        callAt: validatedData.callAt,
        dealId: validatedData.dealId || null,
        companyId: validatedData.companyId || null,
        contactId: validatedData.contactId || null,
      },
      include: {
        deal: { select: { id: true, title: true } },
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(call, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating call:', error)
    return NextResponse.json(
      { error: 'Failed to create call log' },
      { status: 500 }
    )
  }
}
