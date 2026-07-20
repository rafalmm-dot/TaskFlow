import { prisma } from '../../../utils/prisma'

type AddProjectMemberBody = {
  userIds?: number[]
}

export default defineEventHandler(async (event) => {
  const projectId = Number(getRouterParam(event, 'id'))
  const body = await readBody<AddProjectMemberBody>(event)
  const userIds = Array.isArray(body?.userIds)
    ? [...new Set(body.userIds.map(Number))]
    : []

  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nieprawidłowy identyfikator projektu.'
    })
  }

  if (
    userIds.length === 0 ||
    userIds.some(
      (userId) =>
        !Number.isInteger(userId) || userId <= 0
    )
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Wybierz prawidłowych użytkowników.'
    })
  }

  const project = await prisma.projects.findUnique({
    where: {
      id: projectId
    },
    select: {
      id: true
    }
  })

  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Projekt nie istnieje.'
    })
  }

  const users = await prisma.users.findMany({
    where: {
      id: {
        in: userIds
      }
    },
    select: {
      id: true,
      name: true,
      surname: true,
      login: true,
      role: true
    }
  })

  if (users.length !== userIds.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Co najmniej jeden użytkownik nie istnieje.'
    })
  }

  const existingMembers =
    await prisma.project_members.findMany({
      where: {
        project_id: projectId,
        user_id: {
          in: userIds
        }
      }
    })

  if (existingMembers.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'Co najmniej jedna z wybranych osób jest już przypisana do projektu.'
    })
  }

  await prisma.project_members.createMany({
    data: userIds.map((userId) => ({
      project_id: projectId,
      user_id: userId
    }))
  })

  return {
    success: true,
    message: 'Użytkownicy zostali dodani do projektu.',
    userIds,
    users
  }
})
