import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type DealStage = 'LEAD' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST'

export async function GET() {
  try {
    // Get all deals for stats
    const deals = await prisma.deal.findMany({
      include: {
        company: true,
        contact: true,
      },
    })

    // Calculate stats
    const totalDeals = deals.length
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
    const wonValue = deals
      .filter((deal) => deal.stage === 'CLOSED_WON')
      .reduce((sum, deal) => sum + deal.value, 0)

    // Calculate forecast (weighted by probability for open deals)
    const forecast = deals.reduce((sum, deal) => {
      if (deal.stage === 'CLOSED_WON') return sum + deal.value
      if (deal.stage === 'CLOSED_LOST') return sum
      return sum + deal.value * (deal.probability / 100)
    }, 0)

    // Deals by stage
    const dealsByStage: Record<DealStage, number> = {
      'LEAD': 0,
      'QUALIFIED': 0,
      'PROPOSAL': 0,
      'NEGOTIATION': 0,
      'CLOSED_WON': 0,
      'CLOSED_LOST': 0,
    }

    const valueByStage: Record<DealStage, number> = {
      'LEAD': 0,
      'QUALIFIED': 0,
      'PROPOSAL': 0,
      'NEGOTIATION': 0,
      'CLOSED_WON': 0,
      'CLOSED_LOST': 0,
    }

    deals.forEach((deal) => {
      dealsByStage[deal.stage as DealStage]++
      valueByStage[deal.stage as DealStage] += deal.value
    })

    // Tasks due today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const tasksDueToday = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: today,
          lt: tomorrow,
        },
        completed: false,
      },
      include: {
        deal: true,
      },
      orderBy: { dueDate: 'asc' },
    })

    // Recent activities
    const recentActivities = await prisma.activity.findMany({
      include: {
        deal: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Get total counts
    const [companiesCount, contactsCount, tasksCount] = await Promise.all([
      prisma.company.count(),
      prisma.contact.count(),
      prisma.task.count({
        where: { completed: false },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalDeals,
        totalValue,
        forecast,
        wonValue,
        dealsByStage,
        valueByStage,
        companiesCount,
        contactsCount,
        tasksCount,
      },
      tasksDueToday,
      recentActivities,
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
