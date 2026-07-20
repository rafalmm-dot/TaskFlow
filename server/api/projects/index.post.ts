import { prisma } from '../../utils/prisma'

type CreateProjectBody = {
  title?: string
  description?: string
  status?: string
  deadline?: string
  userIds?: number[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateProjectBody>(event)

  const title = body.title?.trim() ?? ''
  const description = body.description?.trim() ?? ''
  const status = body.status?.trim() ?? ''
  const deadline = body.deadline?.trim() ?? ''

  const userIds = [
    ...new Set(
      (body.userIds ?? []).map((userId) => Number(userId))
    )
  ]

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Podaj nazwę projektu.'
    })
  }

  if (!status) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Wybierz status projektu.'
    })
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Wybierz prawidłowy termin projektu.'
    })
  }

  if (userIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Przypisz przynajmniej jednego pracownika.'
    })
  }

  const usersCount = await prisma.users.count({
    where: {
      id: {
        in: userIds
      }
    }
  })

  if (usersCount !== userIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Wybrano nieprawidłowego użytkownika.'
    })
  }

  const createdProject = await prisma.projects.create({
    data: {
      title,
      description: description || null,
      status,

      deadline: new Date(
        `${deadline}T00:00:00.000Z`
      ),

      project_members: {
        create: userIds.map((userId) => ({
          users: {
            connect: {
              id: userId
            }
          }
        }))
      }
    },

    select: {
      id: true,
      title: true,
      description: true,
      deadline: true,
      status: true,
      created_at: true,

      project_members: {
        select: {
          user_id: true,

          users: {
            select: {
              id: true,
              name: true,
              surname: true,
              login: true,
              role: true
            }
          }
        }
      }
    }
  })

  return {
    id: createdProject.id,
    title: createdProject.title,
    description: createdProject.description,

    deadline: createdProject.deadline
      .toISOString()
      .slice(0, 10),

    status: createdProject.status,

    createdAt: createdProject.created_at
      .toISOString()
      .slice(0, 10),

    userIds: createdProject.project_members.map(
      (member) => member.user_id
    ),

    users: createdProject.project_members.map(
      (member) => member.users
    )
  }
})