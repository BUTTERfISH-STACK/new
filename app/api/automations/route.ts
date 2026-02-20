import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { isFeatureEnabled } from '@/lib/featureFlags'

const automationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  triggerType: z.enum(['deal_stage_change', 'task_completed', 'contact_created']),
  actionType: z.enum(['create_task', 'send_email', 'update_deal', 'notify']),
  actionConfig: z.record(z.unknown()),
  triggers: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains']),
    value: z.string(),
  })).optional(),
})

export async function GET(request: NextRequest) {
  try {
    if (!isFeatureEnabled('ENABLE_AUTOMATION_ENGINE')) {
      return NextResponse.json(
        { error: 'Automation engine is not enabled' },
        { status: 403 }
      )
    }

    const automations = await prisma.automation.findMany({
      include: {
        triggers: true,
        actions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: automations })
  } catch (error) {
    console.error('Error fetching automations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch automations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isFeatureEnabled('ENABLE_AUTOMATION_ENGINE')) {
      return NextResponse.json(
        { error: 'Automation engine is not enabled' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = automationSchema.parse(body)

    const automation = await prisma.automation.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        enabled: validatedData.enabled ?? true,
        triggerType: validatedData.triggerType,
        actionType: validatedData.actionType,
        actionConfig: JSON.stringify(validatedData.actionConfig),
        triggers: validatedData.triggers ? {
          create: validatedData.triggers
        } : undefined,
      },
      include: {
        triggers: true,
      },
    })

    return NextResponse.json(automation, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating automation:', error)
    return NextResponse.json(
      { error: 'Failed to create automation' },
      { status: 500 }
    )
  }
}
