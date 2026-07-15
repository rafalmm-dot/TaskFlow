import { prisma } from '../../utils/prisma'

type UpdateTaskBody = {
  title?: string
  description?: string
  status?: string
  priority?: string
  deadline?: string
  assignedUserIds?: number[]
}

export default defineEventHandler(async (event) => {
  const taskId = Number(getRouterParam(event, 'id'))
  const body = await readBody<UpdateTaskBody>(event)

  if (!Number.isInteger(taskId) || taskId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nieprawidłowy identyfikator zadania.'
    })
  }

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

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Podaj tytuł zadania.'
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
      statusMessage: 'Przypisz przynajmniej jedną osobę.'
    })
  }

  const existingTask = await prisma.tasks.findUnique({
    where: {
      id: taskId
    },

    select: {
      id: true,
      project_id: true
    }
  })

  if (!existingTask) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Zadanie nie istnieje.'
    })
  }

  const projectMembersCount =
    await prisma.project_members.count({
      where: {
        project_id: existingTask.project_id,

        user_id: {
          in: assignedUserIds
        }
      }
    })

  if (projectMembersCount !== assignedUserIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Wybrane osoby muszą należeć do zespołu projektu.'
    })
  }

  const updatedTask = await prisma.tasks.update({
    where: {
      id: taskId
    },

    data: {
      title,
      description,
      status,
      priority,

      deadline: new Date(
        `${deadline}T00:00:00.000Z`
      ),

      task_assignees: {
        deleteMany: {},

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
    id: updatedTask.id,
    projectId: updatedTask.project_id,
    createdByUserId: updatedTask.created_by_user_id,

    title: updatedTask.title,
    description: updatedTask.description,
    project: updatedTask.projects.title,
    status: updatedTask.status,
    priority: updatedTask.priority,

    deadline: updatedTask.deadline
      .toISOString()
      .slice(0, 10),

    createdAt: updatedTask.created_at
      .toISOString()
      .slice(0, 10),

    assignedUserIds:
      updatedTask.task_assignees.map(
        (assignee) => assignee.user_id
      ),

    assignedUsers:
      updatedTask.task_assignees.map(
        (assignee) => assignee.users
      )
  }
})