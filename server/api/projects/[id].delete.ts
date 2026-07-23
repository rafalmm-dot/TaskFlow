import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const projectId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nieprawidłowy identyfikator projektu.'
    })
  }

  const existingProject = await prisma.projects.findUnique({
    where: {
      id: projectId
    },
    select: {
      id: true,
      title: true
    }
  })

  if (!existingProject) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Projekt nie istnieje.'
    })
  }

  await prisma.projects.delete({
    where: {
      id: projectId
    }
  })

  return {
    success: true,
    message: 'Projekt został usunięty.',
    deletedProject: {
      id: existingProject.id,
      title: existingProject.title
    }
  }
})
