import { createHash } from 'node:crypto'
import { prisma } from '../../../utils/prisma'

type UpdateUserPasswordBody = {
  password?: string
}

export default defineEventHandler(async (event) => {
  const userId = Number(getRouterParam(event, 'id'))
  const body = await readBody<UpdateUserPasswordBody>(event)

  if (!Number.isInteger(userId) || userId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nieprawidłowy identyfikator użytkownika.'
    })
  }

  const password = body.password?.trim() ?? ''

  if (!password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Podaj nowe hasło.'
    })
  }

  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Hasło musi mieć przynajmniej 8 znaków.'
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

  const passwordHash = createHash('sha256')
    .update(password)
    .digest('hex')

  await prisma.users.update({
    where: {
      id: userId
    },
    data: {
      password_hash: passwordHash
    }
  })

  return {
    success: true
  }
})
