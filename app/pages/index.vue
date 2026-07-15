<<script setup>
import { computed } from 'vue'

const { loggedUser } = useAuth()

const {
  data: tasksFromApi
} = await useFetch('/api/tasks', {
  default: () => []
})

const {
  data: projectsFromApi
} = await useFetch('/api/projects', {
  default: () => []
})

const tasks = computed(() => {
  return tasksFromApi.value ?? []
})

const projects = computed(() => {
  return projectsFromApi.value ?? []
})

const visibleTasks = computed(() => {
  if (!loggedUser.value) {
    return []
  }

  if (loggedUser.value.role === 'szef') {
    return tasks.value
  }

  return tasks.value.filter((task) =>
    task.assignedUserIds?.includes(
      loggedUser.value.id
    )
  )
})

const visibleProjects = computed(() => {
  if (!loggedUser.value) {
    return []
  }

  if (loggedUser.value.role === 'szef') {
    return projects.value
  }

  return projects.value.filter((project) =>
    project.userIds?.includes(
      loggedUser.value.id
    )
  )
})

const normalizeStatus = (status) =>
  String(status ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ł/g, 'l')

const isTodoTask = (task) => {
  return normalizeStatus(task.status) === 'do zrobienia'
}

const isInProgressTask = (task) => {
  return normalizeStatus(task.status) === 'w trakcie'
}

const isDoneTask = (task) => {
  return normalizeStatus(task.status) === 'zakonczone'
}

const latestTasks = computed(() => {
  return [...visibleTasks.value]
    .sort((firstTask, secondTask) => {
      return (
        new Date(firstTask.deadline) -
        new Date(secondTask.deadline)
      )
    })
    .slice(0, 3)
})

const latestProjects = computed(() => {
  return [...visibleProjects.value]
    .sort((firstProject, secondProject) => {
      return (
        new Date(firstProject.deadline) -
        new Date(secondProject.deadline)
      )
    })
    .slice(0, 3)
})

const dashboardCards = computed(() => [
  {
    label:
      loggedUser.value?.role === 'szef'
        ? 'Projekty'
        : 'Moje projekty',

    number: visibleProjects.value.length
  },
  {
    label:
      loggedUser.value?.role === 'szef'
        ? 'Zadania'
        : 'Moje zadania',

    number: visibleTasks.value.length
  },
  {
    label: 'Do zrobienia',

    number: visibleTasks.value.filter(
      isTodoTask
    ).length
  },
  {
    label: 'W trakcie',

    number: visibleTasks.value.filter(
      isInProgressTask
    ).length
  },
  {
    label: 'Zakończone',

    number: visibleTasks.value.filter(
      isDoneTask
    ).length
  }
])
</script>

<template>
  <Topbar />

  <section class="dashboard">
    <DashBoardCard
      v-for="card in dashboardCards"
      :key="card.label"
      :label="card.label"
      :number="card.number"
    />
  </section>

  <section class="tasks-preview">
    <div class="section-header">
      <h2>Ostatnie zadania</h2>
      <a href="#" class="section-header__link">Zobacz wszystkie</a>
    </div>

    <TaskTitle
      v-for="task in latestTasks"
      :key="task.title"
      :title="task.title"
      :project="task.project"
      :status="task.status"
    />
  </section>

  <section class="tasks-preview">
    <div class="section-header">
      <h2>Ostatnie projekty</h2>
      <a href="#" class="section-header__link">Zobacz wszystkie</a>
    </div>

    <ProjectTitle
      v-for="project in latestProjects"
      :key="project.title"
      :title="project.title"
      :deadline="project.deadline"
      :status="project.status"
    />
  </section>
</template>

<style scoped>
h1 {
  margin: 0 0 12px;
  color: #1f2937;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.tasks-preview {
  margin-top: 32px;
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid rgba(226, 232, 240, 0.88);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.section-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  margin: 0;
  color: #111827;
}

.section-header__link {
  color: #2563eb;
  font-weight: bold;
  text-decoration: none;
  transition: color 0.2s ease;
}

.section-header__link:hover {
  color: #1d4ed8;
}
</style>
