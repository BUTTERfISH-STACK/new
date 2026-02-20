import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Clearing database...')
  
  // Delete all records from all models
  await prisma.activity.deleteMany()
  await prisma.task.deleteMany()
  await prisma.email.deleteMany()
  await prisma.callLog.deleteMany()
  await prisma.meeting.deleteMany()
  await prisma.deal.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.company.deleteMany()
  await prisma.automationAction.deleteMany()
  await prisma.automationTrigger.deleteMany()
  await prisma.automation.deleteMany()

  console.log('✅ Database cleared successfully!')
  console.log('')
  console.log('📊 Your CRM pipeline is now empty and ready for real data.')
  console.log('')
  console.log('To add data:')
  console.log('1. Go to the Pipeline page and click "New Deal" to create deals')
  console.log('2. Add companies and contacts from their respective pages')
  console.log('3. Create tasks and log activities as needed')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
