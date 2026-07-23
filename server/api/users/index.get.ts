import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      surname: true,
      login: true,
      role: true,
      is_active: true,
      created_at: true
      
    },
    orderBy: {
      id: 'asc'
    }
  })

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    surname: user.surname,
    login: user.login,
    role: user.role,
    isActive: user.is_active,
    createdAt: user.created_at
      .toISOString()
      .slice(0, 10)
  }))
})
