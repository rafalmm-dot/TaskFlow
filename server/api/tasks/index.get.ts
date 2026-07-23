import { prisma } from '../../utils/prisma'

function normalizePriority(priority: string) {
  if (priority === 'Sredni' || priority === '?redni') {
    return 'Średni'
  }

  return priority
}

export default defineEventHandler(async () => {
  const tasks = await prisma.tasks.findMany({
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
    },

    orderBy: {
      id: 'asc'
    }
  })

  return tasks.map((task) => ({
    id: task.id,
    projectId: task.project_id,
    createdByUserId: task.created_by_user_id,
    title: task.title,
    description: task.description,
    project: task.projects.title,
    status: task.status,
    priority: normalizePriority(task.priority),
    deadline: task.deadline.toISOString().slice(0, 10),
    createdAt: task.created_at.toISOString().slice(0, 10),
    assignedUserIds: task.task_assignees.map(
      (assignee) => assignee.user_id
    ),
    assignedUsers: task.task_assignees.map(
      (assignee) => assignee.users
    )
  }))
})
