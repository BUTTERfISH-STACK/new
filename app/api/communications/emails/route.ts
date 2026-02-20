import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { isFeatureEnabled } from '@/lib/featureFlags'

const emailSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  fromEmail: z.string().email(),
  toEmail: z.string().email(),
  direction: z.enum(['inbound', 'outbound']),
  status: z.enum(['draft', 'sent', 'delivered', 'opened', 'replied', 'failed']).optional(),
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

    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where,
        include: {
          deal: { select: { id: true, title: true } },
          company: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.email.count({ where }),
    ])

    return NextResponse.json({
      data: emails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching emails:', error)
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
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
    const validatedData = emailSchema.parse(body)

    const email = await prisma.email.create({
      data: {
        ...validatedData,
        dealId: validatedData.dealId || null,
        companyId: validatedData.companyId || null,
        contactId: validatedData.contactId || null,
        status: validatedData.status || 'draft',
        sentAt: validatedData.direction === 'outbound' ? new Date() : null,
      },
      include: {
        deal: { select: { id: true, title: true } },
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(email, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating email:', error)
    return NextResponse.json(
      { error: 'Failed to create email' },
      { status: 500 }
    )
  }
}
