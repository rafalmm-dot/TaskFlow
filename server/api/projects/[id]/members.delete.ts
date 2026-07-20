import { prisma } from '../../../utils/prisma'

type RemoveProjectMemberBody = {
  userIds?: number[]
}

export default defineEventHandler(async (event) => {
  const projectId = Number(getRouterParam(event, 'id'))
  const body = await readBody<RemoveProjectMemberBody>(event)
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

  const existingMembers =
    await prisma.project_members.findMany({
      where: {
        project_id: projectId,
        user_id: {
          in: userIds
        }
      },
      select: {
        user_id: true,
        users: {
          select: {
            id: true,
            name: true,
            surname: true,
            role: true
          }
        }
      }
    })

  if (existingMembers.length !== userIds.length) {
    throw createError({
      statusCode: 404,
      statusMessage:
        'Co najmniej jedna z wybranych osób nie jest przypisana do projektu.'
    })
  }

  await prisma.project_members.deleteMany({
    where: {
      project_id: projectId,
      user_id: {
        in: userIds
      }
    }
  })

  return {
    success: true,
    message: 'Wybrane osoby zostały usunięte z projektu.',
    removedUsers: existingMembers.map(
      (member) => member.users
    ),
    userIds
  }
})
