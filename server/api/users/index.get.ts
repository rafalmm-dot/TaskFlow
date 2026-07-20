import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      surname: true,
      login: true,
      role: true,
      created_at: true
    },
    orderBy: {
      id: 'asc'
    }
  })

  return users
})