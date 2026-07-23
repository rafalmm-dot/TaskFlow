import { prisma } from '../../utils/prisma'

type UpdateUserBody = {
  name?: string
  surname?: string
  login?: string
  role?: string
}

export default defineEventHandler(async (event) => {
  const userId = Number(getRouterParam(event, 'id'))
  const body = await readBody<UpdateUserBody>(event)

  if (!Number.isInteger(userId) || userId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nieprawidłowy identyfikator użytkownika.'
    })
  }

  const name = body.name?.trim() ?? ''
  const surname = body.surname?.trim() ?? ''
  const login = body.login?.trim().toLowerCase() ?? ''
  const role = body.role?.trim() ?? ''

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Podaj imię użytkownika.'
    })
  }

  if (!surname) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Podaj nazwisko użytkownika.'
    })
  }

  if (!login) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Podaj login użytkownika.'
    })
  }

  if (login.length < 3) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Login musi mieć przynajmniej 3 znaki.'
    })
  }

  if (!['pracownik', 'szef'].includes(role)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Wybrano nieprawidłową rolę.'
    })
  }

  const existingUser = await prisma.users.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true
    }
  })

  if (!existingUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Użytkownik nie istnieje.'
    })
  }

  const userWithSameLogin = await prisma.users.findFirst({
    where: {
      login,
      id: {
        not: userId
      }
    },
    select: {
      id: true
    }
  })

  if (userWithSameLogin) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Inny użytkownik ma już taki login.'
    })
  }

  const updatedUser = await prisma.users.update({
    where: {
      id: userId
    },
    data: {
      name,
      surname,
      login,
      role
    },
    select: {
      id: true,
      name: true,
      surname: true,
      login: true,
      role: true,
      is_active: true,
      created_at: true
    }
  })

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    surname: updatedUser.surname,
    login: updatedUser.login,
    role: updatedUser.role,
    isActive: updatedUser.is_active,
    createdAt: updatedUser.created_at
      .toISOString()
      .slice(0, 10)
  }
})
