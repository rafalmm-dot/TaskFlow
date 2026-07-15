import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const taskId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(taskId) || taskId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nieprawidłowy identyfikator zadania.'
    })
  }

  const task = await prisma.tasks.findUnique({
    where: {
      id: taskId
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
          id: true,
          title: true
        }
      },

      users: {
        select: {
          id: true,
          name: true,
          surname: true,
          role: true
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

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Nie znaleziono zadania.'
    })
  }

  return {
    id: task.id,
    projectId: task.project_id,
    createdByUserId: task.created_by_user_id,

    title: task.title,
    description: task.description,
    project: task.projects.title,
    status: task.status,
    priority: task.priority,

    deadline: task.deadline.toISOString().slice(0, 10),
    createdAt: task.created_at.toISOString().slice(0, 10),

    assignedUserIds: task.task_assignees.map(
      (assignee) => assignee.user_id
    ),

    assignedUsers: task.task_assignees.map(
      (assignee) => assignee.users
    ),

    createdByUser: task.users
  }
})