import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const projectId = Number(
    getRouterParam(event, 'id')
  )

  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Nieprawidłowy identyfikator projektu.'
    })
  }

  const project = await prisma.projects.findUnique({
    where: {
      id: projectId
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
      },

      tasks: {
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
        },

        orderBy: {
          deadline: 'asc'
        }
      }
    }
  })

  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Nie znaleziono projektu.'
    })
  }

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    deadline: project.deadline
      .toISOString()
      .slice(0, 10),
    status: project.status,
    createdAt: project.created_at
      .toISOString()
      .slice(0, 10),

    userIds: project.project_members.map(
      (member) => member.user_id
    ),

    users: project.project_members.map(
      (member) => member.users
    ),

    tasks: project.tasks.map((task) => ({
      id: task.id,
      projectId: task.project_id,
      createdByUserId: task.created_by_user_id,
      title: task.title,
      description: task.description,
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
    }))
  }
})