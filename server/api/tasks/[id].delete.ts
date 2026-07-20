import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const taskId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(taskId) || taskId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nieprawidłowy identyfikator zadania.'
    })
  }

  const existingTask = await prisma.tasks.findUnique({
    where: {
      id: taskId
    },

    select: {
      id: true,
      title: true
    }
  })

  if (!existingTask) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Zadanie nie istnieje.'
    })
  }

  await prisma.tasks.delete({
    where: {
      id: taskId
    }
  })

  return {
    success: true,
    message: 'Zadanie zostało usunięte.',
    deletedTask: {
      id: existingTask.id,
      title: existingTask.title
    }
  }
})