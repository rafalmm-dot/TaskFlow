import { prisma } from '../utils/prisma'

export default defineEventHandler(async () => {
  const projects = await prisma.projects.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      deadline: true,
      status: true,

      project_members: {
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

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    deadline: project.deadline.toISOString().slice(0, 10),
    status: project.status,

    userIds: project.project_members.map(
      (member) => member.user_id
    ),

    users: project.project_members.map(
      (member) => member.users
    )
  }))
})