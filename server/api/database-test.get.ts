import { prisma } from '../utils/prisma'

export default defineEventHandler(async () => {
  await prisma.$queryRaw`SELECT 1`

  return {
    success: true,
    message: 'Połączenie z bazą MySQL działa poprawnie.'
  }
})