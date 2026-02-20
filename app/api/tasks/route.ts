import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dealId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const completed = searchParams.get('completed')
    const dealId = searchParams.get('dealId')
    const overdue = searchParams.get('overdue')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (completed !== null && completed !== undefined) {
      where.completed = completed === 'true'
    }

    if (dealId) {
      where.dealId = dealId
    }

    if (overdue === 'true') {
      where.dueDate = {
        lt: new Date(),
      }
      where.completed = false
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          deal: true,
        },
        orderBy: [
          { completed: 'asc' },
          { dueDate: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ])

    return NextResponse.json({
      data: tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = taskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        dealId: validatedData.dealId || null,
      },
      include: {
        deal: true,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
