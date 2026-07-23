import { prisma } from '../../../utils/prisma'

type UpdateUserStatusBody = {
  isActive?: boolean
}

export default defineEventHandler(async (event) => {
  const userId = Number(getRouterParam(event, 'id'))
  const body = await readBody<UpdateUserStatusBody>(event)

  if (!Number.isInteger(userId) || userId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nieprawidłowy identyfikator użytkownika.'
    })
  }

  if (typeof body.isActive !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Podaj prawidłowy status użytkownika.'
    })
  }

  const updatedUser = await prisma.users.update({
    where: {
      id: userId
    },
    data: {
      is_active: body.isActive
    },
    select: {
      id: true,
      name: true,
      surname: true,
      login: true,
      role: true,
      is_active: true
    }
  })

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    surname: updatedUser.surname,
    login: updatedUser.login,
    role: updatedUser.role,
    isActive: updatedUser.is_active
  }
})