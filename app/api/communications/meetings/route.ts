import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { isFeatureEnabled } from '@/lib/featureFlags'

const meetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled']).optional(),
  notes: z.string().optional(),
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

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        include: {
          deal: { select: { id: true, title: true } },
          company: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { startTime: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.meeting.count({ where }),
    ])

    return NextResponse.json({
      data: meetings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching meetings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
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
    const validatedData = meetingSchema.parse(body)

    const meeting = await prisma.meeting.create({
      data: {
        ...validatedData,
        dealId: validatedData.dealId || null,
        companyId: validatedData.companyId || null,
        contactId: validatedData.contactId || null,
        status: validatedData.status || 'scheduled',
      },
      include: {
        deal: { select: { id: true, title: true } },
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(meeting, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating meeting:', error)
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    )
  }
}
