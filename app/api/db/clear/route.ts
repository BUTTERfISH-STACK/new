import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE() {
  try {
    // Delete in order to respect foreign key constraints
    // Automation triggers and actions have cascade delete to automation
    await prisma.automationTrigger.deleteMany()
    await prisma.automationAction.deleteMany()
    await prisma.automation.deleteMany()
    
    // Communication records
    await prisma.activity.deleteMany()
    await prisma.task.deleteMany()
    await prisma.email.deleteMany()
    await prisma.callLog.deleteMany()
    await prisma.meeting.deleteMany()
    
    // Core records (deals must be deleted before company/contact due to relations)
    await prisma.deal.deleteMany()
    await prisma.contact.deleteMany()
    await prisma.company.deleteMany()

    return NextResponse.json({ 
      success: true, 
      message: 'Dashboard metrics cleared successfully' 
    })
  } catch (error) {
    console.error('Error clearing dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to clear dashboard data' },
      { status: 500 }
    )
  }
}
