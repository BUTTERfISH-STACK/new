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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        contact: true,
        tasks: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Error fetching deal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = dealSchema.partial().parse(body)

    const deal = await prisma.deal.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        expectedCloseDate: validatedData.expectedCloseDate 
          ? new Date(validatedData.expectedCloseDate) 
          : validatedData.expectedCloseDate === null 
            ? null 
            : undefined,
        companyId: validatedData.companyId || null,
        contactId: validatedData.contactId || null,
      },
      include: {
        company: true,
        contact: true,
      },
    })

    return NextResponse.json(deal)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating deal:', error)
    return NextResponse.json(
      { error: 'Failed to update deal' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.deal.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting deal:', error)
    return NextResponse.json(
      { error: 'Failed to delete deal' },
      { status: 500 }
    )
  }
}
