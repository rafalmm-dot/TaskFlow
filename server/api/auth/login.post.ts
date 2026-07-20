import { createHash } from 'node:crypto'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const login = String(body?.login ?? '').trim()
  const password = String(body?.password ?? '')

  if (!login || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Podaj login i hasło.'
    })
  }

  const user = await prisma.users.findUnique({
    where: {
      login
    },
    select: {
      id: true,
      name: true,
      surname: true,
      login: true,
      password_hash: true,
      role: true
    }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Nieprawidłowy login lub hasło.'
    })
  }

  const enteredPasswordHash = createHash('sha256')
    .update(password)
    .digest('hex')

  if (enteredPasswordHash !== user.password_hash) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Nieprawidłowy login lub hasło.'
    })
  }

  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    login: user.login,
    role: user.role
  }
})