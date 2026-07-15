import { prisma } from '../utils/prisma'

type CreateTaskBody = {
  projectId?: number
  createdByUserId?: number
  title?: string
  description?: string
  status?: string
  priority?: string
  deadline?: string
  assignedUserIds?: number[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateTaskBody>(event)

  const projectId = Number(body.projectId)
  const createdByUserId = Number(body.createdByUserId)

  const title = body.title?.trim() ?? ''
  const description = body.description?.trim() ?? ''
  const status = body.status?.trim() ?? ''
  const priority = body.priority?.trim() ?? ''
  const deadline = body.deadline?.trim() ?? ''

  const assignedUserIds = [
    ...new Set(
      (body.assignedUserIds ?? []).map((userId) =>
        Number(userId)
      )
    )
  ]

  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nieprawidłowy projekt.'
    })
  }

  if (
    !Number.isInteger(createdByUserId) ||
    createdByUserId <= 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nieprawidłowy autor zadania.'
    })
  }

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Podaj nazwę zadania.'
    })
  }

  if (!description) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Podaj opis zadania.'
    })
  }

  if (!status) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Wybierz status zadania.'
    })
  }

  if (!priority) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Wybierz priorytet zadania.'
    })
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Wybierz prawidłowy termin.'
    })
  }

  if (assignedUserIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Przypisz przynajmniej jedną osobę.'
    })
  }

  const [project, creator, usersCount] =
    await Promise.all([
      prisma.projects.findUnique({
        where: {
          id: projectId
        },
        select: {
          id: true
        }
      }),

      prisma.users.findUnique({
        where: {
          id: createdByUserId
        },
        select: {
          id: true
        }
      }),

      prisma.users.count({
        where: {
          id: {
            in: assignedUserIds
          }
        }
      })
    ])

  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Projekt nie istnieje.'
    })
  }

  if (!creator) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Autor zadania nie istnieje.'
    })
  }

  if (usersCount !== assignedUserIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Co najmniej jeden pracownik nie istnieje.'
    })
  }

  const task = await prisma.tasks.create({
    data: {
      project_id: projectId,
      created_by_user_id: createdByUserId,
      title,
      description,
      status,
      priority,
      deadline: new Date(
        `${deadline}T00:00:00.000Z`
      ),

      task_assignees: {
        create: assignedUserIds.map((userId) => ({
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
      project_id: true,
      created_by_user_id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      deadline: true,
      created_at: true,

      projects: {
        select: {
          title: true
        }
      },

      task_assignees: {
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
      }
    }
  })

  return {
    id: task.id,
    projectId: task.project_id,
    createdByUserId: task.created_by_user_id,

    title: task.title,
    description: task.description,
    project: task.projects.title,
    status: task.status,
    priority: task.priority,

    deadline: task.deadline
      .toISOString()
      .slice(0, 10),

    createdAt: task.created_at
      .toISOString()
      .slice(0, 10),

    assignedUserIds: task.task_assignees.map(
      (assignee) => assignee.user_id
    ),

    assignedUsers: task.task_assignees.map(
      (assignee) => assignee.users
    )
  }
})