<template>
  <section v-if="project" class="project-detail">
    <section class="project-page">
      <div class="project-header">
        <div>
          <h1>{{ project.title }}</h1>
          <p>{{ project.deadline }}</p>
        </div>

        <span class="project-status">
          {{ project.status }}
        </span>
      </div>
    </section>

    <section class="project-tasks">
      <div class="section-header">
        <h2>Zadania projektu</h2>

        <button class="add-task-button" @click="showTaskForm = true">
          Dodaj zadanie
        </button>
      </div>

      <TaskTitle
        v-for="task in projectTasks"
        :key="task.id"
        :title="task.title"
        :project="project.title"
        :status="task.status"
      />

      <p v-if="projectTasks.length === 0" class="empty-state">
        Ten projekt nie ma jeszcze zadnych zadan.
      </p>
    </section>

    <div
      v-if="showTaskForm"
      class="task-modal"
      @click.self="closeTaskForm"
    >
      <div class="task-modal__card">
        <div class="task-modal__header">
          <div>
            <h3>Nowe zadanie</h3>
            <p>Dodaj nowe zadanie do projektu {{ project.title }}.</p>
          </div>

          <button class="task-modal__close" @click="closeTaskForm">
            Zamknij
          </button>
        </div>

        <form class="task-form" @submit.prevent="submitTask">
          <label class="task-form__field">
            <span>Tytul zadania</span>
            <input
              v-model="taskForm.title"
              type="text"
              placeholder="Np. Przygotowac makiety"
            />
          </label>

          <label class="task-form__field">
            <span>Status</span>
            <select v-model="taskForm.status">
              <option>Do zrobienia</option>
              <option>W trakcie</option>
              <option>Zakonczone</option>
            </select>
          </label>

          <div class="task-form__actions">
            <button
              type="button"
              class="task-form__button task-form__button--ghost"
              @click="closeTaskForm"
            >
              Anuluj
            </button>
            <button
              type="submit"
              class="task-form__button task-form__button--primary"
            >
              Zapisz zadanie
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>

  <section v-else class="project-page">
    <h1>Nie znaleziono projektu</h1>
    <p>Projekt o takim numerze nie istnieje.</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { tasks } from '~/data/tasks'
import { projects } from '~/data/projects'

const showTaskForm = ref(false)
const localTasks = ref([...tasks])
const taskForm = ref({
  title: '',
  status: 'Do zrobienia'
})

const route = useRoute()
const currentProjectId = Number(route.params.id)
const project = projects.find(
  (projectItem) => projectItem.id === currentProjectId
)
const projectTasks = computed(() =>
  localTasks.value.filter((task) => task.projectId === currentProjectId)
)

const resetTaskForm = () => {
  taskForm.value = {
    title: '',
    status: 'Do zrobienia'
  }
}

const closeTaskForm = () => {
  resetTaskForm()
  showTaskForm.value = false
}

const submitTask = () => {
  const trimmedTitle = taskForm.value.title.trim()

  if (!trimmedTitle || !project) {
    return
  }

  localTasks.value.unshift({
    id: Date.now(),
    projectId: currentProjectId,
    title: trimmedTitle,
    project: project.title,
    status: taskForm.value.status
  })

  closeTaskForm()
}
</script>

<style scoped>
.project-detail {
  position: relative;
}

.project-page {
  padding: 8px;
}

.project-header {
  padding: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px;
  background: white;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.project-header h1 {
  margin: 0 0 8px;
  color: #111827;
}

.project-header p {
  margin: 0;
  color: #6b7280;
}

.project-status {
  padding: 8px 12px;
  border-radius: 999px;
  color: #1e40af;
  background: #dbeafe;
  font-size: 13px;
  font-weight: 700;
}

.project-tasks {
  margin-top: 24px;
  padding: 22px 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.section-header {
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.section-header h2 {
  margin: 0;
  color: #111827;
  font-size: 20px;
}

.add-task-button {
  padding: 11px 16px;
  border: 0;
  border-radius: 14px;
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.add-task-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(37, 99, 235, 0.24);
  filter: brightness(1.03);
}

.empty-state {
  margin: 18px 0 0;
  color: #64748b;
}

.task-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(6px);
  z-index: 30;
}

.task-modal__card {
  width: min(100%, 520px);
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
}

.task-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.task-modal__header h3 {
  margin: 0 0 8px;
  color: #111827;
  font-size: 24px;
}

.task-modal__header p {
  margin: 0;
  color: #64748b;
  line-height: 1.5;
}

.task-modal__close {
  padding: 10px 14px;
  border: 0;
  border-radius: 12px;
  background: #e2e8f0;
  color: #0f172a;
  font-weight: 700;
  cursor: pointer;
}

.task-form {
  display: grid;
  gap: 16px;
}

.task-form__field {
  display: grid;
  gap: 8px;
}

.task-form__field span {
  color: #334155;
  font-size: 14px;
  font-weight: 700;
}

.task-form__field input,
.task-form__field select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  background: white;
  color: #111827;
  font: inherit;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.task-form__field input:focus,
.task-form__field select:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.18);
}

.task-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.task-form__button {
  padding: 12px 16px;
  border: 0;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

.task-form__button--ghost {
  color: #0f172a;
  background: #e2e8f0;
}

.task-form__button--primary {
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.2);
}
</style>
