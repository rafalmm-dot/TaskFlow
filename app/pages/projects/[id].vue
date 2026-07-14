<template>
  <section v-if="project" class="project-detail">
    <div v-if="!canViewProject" class="access-toast">
      Nie jestes przypisany do tego projektu.
    </div>

    <template v-if="canViewProject">
      <div class="project-actions">
        <NuxtLink to="/projects" class="project-actions__back">
          ← Wróć do projektów
        </NuxtLink>
      </div>

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

    <section class="project-team">
  <div class="project-team__header">
    <div>
      <h2>Zespół projektu</h2>

      <p>
        Liczba przypisanych osób: {{ projectUsers.length }}
      </p>
    </div>

    <button
      v-if="loggedUser?.role === 'szef'"
      type="button"
      class="project-team__add-button"
    >
      Dodaj osobę
    </button>
  </div>

  <div
    v-if="projectUsers.length > 0"
    class="project-team__list"
  >
    <article
      v-for="user in projectUsers"
      :key="user.id"
      class="project-team__person"
    >
      <div class="project-team__avatar">
        {{ user.name?.charAt(0) }}{{ user.surname?.charAt(0) }}
      </div>

      <div class="project-team__details">
        <strong>
          {{ user.name }} {{ user.surname }}
        </strong>

        <span>{{ user.role }}</span>
      </div>
    </article>
  </div>

  <p v-else class="project-team__empty">
    Do tego projektu nie przypisano jeszcze żadnej osoby.
  </p>
</section>

    <section class="project-tasks">
      <div class="section-header">
        <h2>Zadania projektu</h2>

        <button
        class="add-task-button" @click="openTaskForm">
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
      class="create-task-modal"
      @click.self="closeTaskForm"
    >
      <div class="create-task-modal__content">
        <div class="create-task-modal__header">
          <div>
            <span class="create-task-modal__eyebrow">
              Nowe zadanie
            </span>

            <h2>Stworz zadanie</h2>
            <p>Dodaj nowe zadanie do projektu {{ project.title }}.</p>
          </div>

          <button
            type="button"
            class="create-task-modal__close"
            aria-label="Zamknij formularz"
            @click="closeTaskForm"
          >
            ×
          </button>
        </div>

        <form class="create-task-form" @submit.prevent="submitTask">
          <label class="create-task-form__field create-task-form__field--full">
            <span>Nazwa zadania</span>
            <input
              v-model="taskForm.title"
              type="text"
              placeholder="Np. Przygotowanie projektu strony glownej"
            />
          </label>

          <label class="create-task-form__field create-task-form__field--full">
            <span>Dokladny opis zadania</span>
            <textarea
              v-model="taskForm.description"
              rows="6"
              placeholder="Opisz zakres zadania, wymagania i oczekiwany rezultat..."
            />
            <small>
              Opis powinien dokladnie wyjasniac, co nalezy wykonac.
            </small>
          </label>

          <label class="create-task-form__field">
            <span>Projekt</span>
            <select v-model="taskForm.projectId" disabled>
              <option :value="project.id">
                {{ project.title }}
              </option>
            </select>
          </label>

          <label class="create-task-form__field">
            <span>Status poczatkowy</span>
            <select v-model="taskForm.status">
              <option>Do zrobienia</option>
              <option>W trakcie</option>
              <option>Zakonczone</option>
            </select>
          </label>

          <label class="create-task-form__field">
            <span>Priorytet</span>
            <select v-model="taskForm.priority">
              <option>Niski</option>
              <option>Sredni</option>
              <option>Wysoki</option>
            </select>
          </label>

          <label class="create-task-form__field">
            <span>Termin wykonania</span>
            <input
              v-model="taskForm.deadline"
              type="date"
            />
          </label>

          <fieldset class="create-task-form__people">
            <legend>Osoby przypisane do zadania</legend>

            <p
              v-if="isBoss"
              class="create-task-form__people-description"
            >
              Mozesz zaznaczyc osoby nalezace do tego projektu.
            </p>

            <p
              v-else
              class="create-task-form__people-description"
            >
              Jako pracownik mozesz przypisac to zadanie tylko do siebie.
            </p>

            <div class="create-task-form__people-list">
              <label
                v-for="user in assignableUsers"
                :key="user.id"
                class="create-task-form__person"
              >
                <input
                  v-model="taskForm.assignedUserIds"
                  type="checkbox"
                  :value="user.id"
                  :disabled="!isBoss"
                />

                <span class="create-task-form__avatar">
                  {{ user.name?.charAt(0) }}{{ user.surname?.charAt(0) }}
                </span>

                <span class="create-task-form__person-details">
                  <strong>
                    {{ user.name }} {{ user.surname }}
                  </strong>

                  <small>{{ user.role }}</small>
                </span>
              </label>
            </div>
          </fieldset>

          <div class="create-task-modal__actions">
            <button
              type="button"
              class="create-task-modal__cancel"
              @click="closeTaskForm"
            >
              Anuluj
            </button>
            <button
              type="submit"
              class="create-task-modal__submit"
            >
              Zapisz zadanie
            </button>
          </div>
        </form>
      </div>
    </div>
    </template>
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
import { users } from '~/data/users'


const { loggedUser } = useAuth()
const showTaskForm = ref(false)
const localTasks = ref([...tasks])
const route = useRoute()
const currentProjectId = Number(route.params.id)
const project = projects.find(
  (projectItem) => projectItem.id === currentProjectId
)
const isBoss = computed(() => loggedUser.value?.role === 'szef')
const currentWorker = computed(() => {
  if (!loggedUser.value || loggedUser.value.role !== 'pracownik') {
    return null
  }

  return users.find((user) => user.id === loggedUser.value.id) ?? null
})
const taskForm = ref({
  title: '',
  description: '',
  projectId: currentProjectId,
  status: 'Do zrobienia',
  priority: 'Sredni',
  deadline: '',
  assignedUserIds: []
})
const projectUsers = computed(() => {
  if (!project) {
    return []
  }

  return users.filter((user) =>
    project.userIds?.includes(user.id)
  )
})
const assignableUsers = computed(() => {
  if (isBoss.value) {
    return projectUsers.value.filter((user) => user.role === 'pracownik')
  }

  return currentWorker.value ? [currentWorker.value] : []
})

const projectTasks = computed(() =>
  localTasks.value.filter((task) => task.projectId === currentProjectId)
)


const resetTaskForm = () => {
  taskForm.value = {
    title: '',
    description: '',
    projectId: currentProjectId,
    status: 'Do zrobienia',
    priority: 'Sredni',
    deadline: '',
    assignedUserIds: isBoss.value || !loggedUser.value ? [] : [loggedUser.value.id]
  }
}

const openTaskForm = () => {
  resetTaskForm()
  showTaskForm.value = true
}

const closeTaskForm = () => {
  resetTaskForm()
  showTaskForm.value = false
}

const submitTask = () => {
  const trimmedTitle = taskForm.value.title.trim()
  const trimmedDescription = taskForm.value.description.trim()

  if (!trimmedTitle || !trimmedDescription || !project || !taskForm.value.deadline) {
    return
  }

  const assignedUserIds = isBoss.value
    ? [...taskForm.value.assignedUserIds]
    : loggedUser.value
      ? [loggedUser.value.id]
      : []

  if (assignedUserIds.length === 0 || !loggedUser.value) {
    return
  }

  localTasks.value.unshift({
    id: Date.now(),
    projectId: currentProjectId,
    assignedUserIds,
    createdByUserId: loggedUser.value.id,
    title: trimmedTitle,
    description: trimmedDescription,
    project: project.title,
    status: taskForm.value.status,
    priority: taskForm.value.priority,
    deadline: taskForm.value.deadline,
    createdAt: new Date().toISOString().slice(0, 10)
  })

  closeTaskForm()
}

const canViewProject = computed(() => {
  if (!loggedUser.value) {
    return false
  }

  if (loggedUser.value.role === 'szef') {
    return true
  }

  return project?.userIds?.includes(loggedUser.value.id) ?? false
})
</script>

<style scoped>
.project-detail {
  position: relative;
}

.project-page {
  padding: 2px;
}

.access-toast {
  position: fixed;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 35;
  min-width: 280px;
  max-width: 420px;
  padding: 14px 18px;
  border-radius: 16px;
  color: #b91c1c;
  background: #fee2e2;
  border: 1px solid #fecaca;
  box-shadow: 0 18px 40px rgba(127, 29, 29, 0.18);
  font-weight: 600;
  text-align: center;
}

.project-header {
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 14px;
  background: white;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.07);
}

.project-header h1 {
  margin: 0 0 6px;
  color: #111827;
  font-size: 20px;
}

.project-header p {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}

.project-status {
  padding: 6px 10px;
  border-radius: 999px;
  color: #1e40af;
  background: #dbeafe;
  font-size: 11px;
  font-weight: 700;
}

.project-tasks {
  margin-top: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
}

.section-header {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.section-header h2 {
  margin: 0;
  color: #111827;
  font-size: 16px;
}

.add-task-button {
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 10px;
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.add-task-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(37, 99, 235, 0.22);
  filter: brightness(1.03);
}

.empty-state {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 12px;
}

.create-task-modal {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(15, 23, 42, 0.54);
  backdrop-filter: blur(7px);
}

.create-task-modal__content {
  width: min(100%, 920px);
  max-height: calc(100vh - 36px);
  padding: 18px;
  overflow-y: auto;
  border: 1px solid rgba(191, 219, 254, 0.7);
  border-radius: 18px;
  background:
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.14), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.24);
}

.create-task-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.create-task-modal__eyebrow {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 6px 10px;
  border-radius: 999px;
  color: #1d4ed8;
  background: rgba(219, 234, 254, 0.8);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.create-task-modal__header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
  line-height: 1.1;
}

.create-task-modal__header p {
  margin: 8px 0 0;
  max-width: 560px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.create-task-modal__close {
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 12px;
  background: #e2e8f0;
  color: #334155;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.create-task-modal__close:hover {
  transform: translateY(-1px);
  background: #cbd5e1;
  color: #0f172a;
}

.create-task-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.create-task-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.create-task-form__field--full {
  grid-column: 1 / -1;
}

.create-task-form__field span {
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.create-task-form__field input,
.create-task-form__field textarea,
.create-task-form__field select {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 11px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
  font: inherit;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.create-task-form__field input:focus,
.create-task-form__field textarea:focus,
.create-task-form__field select:focus {
  border-color: #60a5fa;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.15);
}

.create-task-form__field textarea {
  min-height: 108px;
  resize: vertical;
  line-height: 1.5;
}

.create-task-form__field small,
.create-task-form__people-description,
.create-task-form__person small {
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.create-task-form__people {
  grid-column: 1 / -1;
  margin: 0;
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.9);
}

.create-task-form__people legend {
  padding: 0 8px;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.create-task-form__people-description {
  margin: 0 0 12px;
}

.create-task-form__people-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.create-task-form__person {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.create-task-form__person:hover {
  transform: translateY(-1px);
  border-color: #bfdbfe;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
}

.create-task-form__person input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #2563eb;
  cursor: pointer;
}

.create-task-form__person input:disabled {
  cursor: not-allowed;
  opacity: 0.9;
}

.create-task-form__avatar {
  display: inline-flex;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #1d4ed8;
  background: #dbeafe;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.create-task-form__person-details strong,
.create-task-form__person-details small {
  display: block;
}

.create-task-form__person-details strong {
  color: #0f172a;
}

.create-task-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
  grid-column: 1 / -1;
}

.create-task-modal__cancel,
.create-task-modal__submit {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.create-task-modal__cancel {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
}

.create-task-modal__cancel:hover {
  transform: translateY(-1px);
  background: #f8fafc;
}

.create-task-modal__submit {
  border: 0;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #eff6ff;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.18);
}

.create-task-modal__submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(37, 99, 235, 0.22);
}

.project-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 2px;
}

.project-actions__back {
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.project-actions__back:hover {
  color: #2563eb;
}
.project-team {
  margin-top: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
}

.project-team__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.project-team__header h2 {
  margin: 0;
  color: #111827;
  font-size: 16px;
}

.project-team__header p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
}

.project-team__add-button {
  min-height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 10px;
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.18);
}

.project-team__add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(37, 99, 235, 0.22);
}

.project-team__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.project-team__person {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: #ffffff;
}

.project-team__avatar {
  display: flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  font-size: 11px;
  font-weight: 800;
  box-shadow: 0 8px 14px rgba(37, 99, 235, 0.18);
}

.project-team__details {
  min-width: 0;
}

.project-team__details strong,
.project-team__details span {
  display: block;
}

.project-team__details strong {
  color: #111827;
  font-size: 13px;
}

.project-team__details span {
  margin-top: 2px;
  color: #64748b;
  font-size: 12px;
  text-transform: capitalize;
}

.project-team__empty {
  margin: 0;
  padding: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  color: #64748b;
  background: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

@media (max-width: 720px) {
  .project-header,
  .project-team__header,
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .project-team__list,
  .create-task-form,
  .create-task-form__people-list {
    grid-template-columns: 1fr;
  }

  .create-task-modal {
    padding: 10px;
  }

  .create-task-modal__content {
    max-height: calc(100vh - 20px);
    padding: 14px;
    border-radius: 16px;
  }

  .create-task-modal__header h2 {
    font-size: 20px;
  }

  .create-task-modal__actions {
    flex-direction: column-reverse;
  }

  .create-task-modal__cancel,
  .create-task-modal__submit,
  .add-task-button {
    width: 100%;
  }
}
</style>
