import { createHash } from 'node:crypto'
import { prisma } from '../../utils/prisma'

type CreateUserBody = {
  name?: string
  surname?: string
  login?: string
  password?: string
  role?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateUserBody>(event)

  const name = body.name?.trim() ?? ''
  const surname = body.surname?.trim() ?? ''
  const login = body.login?.trim().toLowerCase() ?? ''
  const password = body.password ?? ''
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

  if (!password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Podaj hasło użytkownika.'
    })
  }

  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Hasło musi mieć przynajmniej 8 znaków.'
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
      login
    },

    select: {
      id: true
    }
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Użytkownik z takim loginem już istnieje.'
    })
  }

  const passwordHash = createHash('sha256')
    .update(password)
    .digest('hex')

  const createdUser = await prisma.users.create({
    data: {
      name,
      surname,
      login,
      password_hash: passwordHash,
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
    id: createdUser.id,
    name: createdUser.name,
    surname: createdUser.surname,
    login: createdUser.login,
    role: createdUser.role,
    isActive: createdUser.is_active,
    createdAt: createdUser.created_at
      .toISOString()
      .slice(0, 10)
  }
})
