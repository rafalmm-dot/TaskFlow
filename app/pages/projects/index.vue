<template>
  <section class="projects-page">
    <div v-if="accessToast" class="access-toast" role="alert" aria-live="polite">
      <span class="access-toast__accent" />
      <div class="access-toast__content">
        <strong>Brak dostepu</strong>
        <p>{{ accessToast }}</p>
      </div>
    </div>

    <div class="page-header">
      <span class="page-header__eyebrow">Panel glowny</span>
      <h1>Projekty</h1>
      <p>W tym miejscu pojawi sie lista projektow realizowanych w firmie.</p>
    </div>

    <section class="projects-panel">
      <div class="projects-panel__header">
        <h2>Lista projektow</h2>
        <span class="projects-panel__badge">{{ projects.length }}</span>
      </div>

      <div class="projects-list">
        <button
          v-for="project in projects"
          :key="project.id"
          class="projects-list__link"
          type="button"
          @click="openProject(project)"
        >
       <ProjectTitle
  :title="project.title"
  :deadline="project.deadline"
  :status="project.status"
  :team="getProjectUsers(project)"
/>
        </button>
      </div>
    </section>

    <div class="floating-actions">
 <button
  v-if="loggedUser?.role === 'szef'"
  type="button"
  class="add-project-button"
  @click="openCreateProjectForm"
>
  Dodaj projekt
</button>
<div
  v-if="showCreateProjectForm"
  class="project-modal"
  @click.self="closeCreateProjectForm"
>
  <form
    class="project-modal__content"
    @submit.prevent="submitCreateProject"
  >
    <h2>Dodaj projekt</h2>

    <label>
      Nazwa projektu
      <input
        v-model="createProjectForm.title"
        type="text"
      >
    </label>

    <label>
      Opis
      <textarea
        v-model="createProjectForm.description"
      />
    </label>

    <label>
      Status
      <select v-model="createProjectForm.status">
        <option value="Planowanie">
          Planowanie
        </option>
        <option value="W trakcie">
          W trakcie
        </option>
        <option value="Gotowe">
          Gotowe
        </option>
      </select>
    </label>

    <label>
      Termin
      <input
        v-model="createProjectForm.deadline"
        type="date"
      >
    </label>

    <fieldset>
      <legend>Pracownicy projektu</legend>

      <p v-if="usersLoading">
        Ładowanie pracowników...
      </p>

      <label
        v-for="user in workerUsers"
        :key="user.id"
      >
        <input
          v-model="createProjectForm.userIds"
          type="checkbox"
          :value="user.id"
        >

        {{ user.name }} {{ user.surname }}
      </label>
    </fieldset>

    <p
      v-if="createProjectError"
      class="form-error"
    >
      {{ createProjectError }}
    </p>

    <div class="project-modal__actions">
      <button
        type="button"
        :disabled="isCreatingProject"
        @click="closeCreateProjectForm"
      >
        Anuluj
      </button>

      <button
        type="submit"
        :disabled="isCreatingProject"
      >
        {{
          isCreatingProject
            ? 'Zapisywanie...'
            : 'Dodaj projekt'
        }}
      </button>
    </div>
  </form>
</div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const { loggedUser } = useAuth()

const {
  data: projectsFromApi,
  pending: projectsLoading,
  error: projectsError
} = await useFetch('/api/projects', {
  default: () => []
})

const {
  data: usersFromApi,
  pending: usersLoading
} = await useFetch('/api/users', {
  default: () => []
})

const accessToast = ref('')

const showCreateProjectForm = ref(false)
const isCreatingProject = ref(false)
const createProjectError = ref('')

const createProjectForm = ref({
  title: '',
  description: '',
  status: 'Planowanie',
  deadline: '',
  userIds: []
})

const projects = computed(() => {
  return projectsFromApi.value ?? []
})

const workerUsers = computed(() => {
  return (usersFromApi.value ?? []).filter(
    (user) => user.role === 'pracownik'
  )
})

function getProjectUsers(project) {
  return project.users ?? []
}

function canViewProject(project) {
  if (!loggedUser.value) {
    return false
  }

  if (loggedUser.value.role === 'szef') {
    return true
  }

  return (
    project.userIds?.includes(loggedUser.value.id) ??
    false
  )
}

function openProject(project) {
  if (canViewProject(project)) {
    navigateTo(`/projects/${project.id}`)
    return
  }

  accessToast.value =
    'Nie jesteś przypisany do tego projektu.'

  setTimeout(() => {
    accessToast.value = ''
  }, 3000)
}

function resetCreateProjectForm() {
  createProjectForm.value = {
    title: '',
    description: '',
    status: 'Planowanie',
    deadline: '',
    userIds: []
  }

  createProjectError.value = ''
}

function openCreateProjectForm() {
  resetCreateProjectForm()
  showCreateProjectForm.value = true
}

function closeCreateProjectForm() {
  if (isCreatingProject.value) {
    return
  }

  showCreateProjectForm.value = false
  createProjectError.value = ''
}

async function submitCreateProject() {
  if (isCreatingProject.value) {
    return
  }

  createProjectError.value = ''

  const payload = {
    title: createProjectForm.value.title.trim(),
    description:
      createProjectForm.value.description.trim(),
    status: createProjectForm.value.status,
    deadline: createProjectForm.value.deadline,
    userIds: [
      ...createProjectForm.value.userIds
    ]
  }

  if (!payload.title) {
    createProjectError.value =
      'Podaj nazwę projektu.'
    return
  }

  if (!payload.status) {
    createProjectError.value =
      'Wybierz status projektu.'
    return
  }

  if (!payload.deadline) {
    createProjectError.value =
      'Wybierz termin projektu.'
    return
  }

  if (payload.userIds.length === 0) {
    createProjectError.value =
      'Przypisz przynajmniej jednego pracownika.'
    return
  }

  try {
    isCreatingProject.value = true

    const createdProject = await $fetch(
      '/api/projects',
      {
        method: 'POST',
        body: payload
      }
    )

    projectsFromApi.value = [
      createdProject,
      ...(projectsFromApi.value ?? [])
    ]

    showCreateProjectForm.value = false
    resetCreateProjectForm()
  } catch (error) {
    console.error(
      'Nie udało się utworzyć projektu:',
      error
    )

    createProjectError.value =
      error?.data?.statusMessage ??
      'Nie udało się zapisać projektu w bazie danych.'
  } finally {
    isCreatingProject.value = false
  }
}
</script>

<style scoped>
.projects-page {
  position: relative;
  min-height: 100%;
  padding: 8px;
  padding-bottom: 96px;
}

.access-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 35;
  width: min(100%, 440px);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 20px;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow:
    0 22px 50px rgba(15, 23, 42, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
  animation: access-toast-in 0.22s ease;
}

.access-toast__accent {
  width: 4px;
  align-self: stretch;
  flex-shrink: 0;
  border-radius: 999px;
  background: linear-gradient(180deg, #ef4444 0%, #f97316 100%);
}

.access-toast__content {
  min-width: 0;
}

.access-toast__content strong {
  display: block;
  margin-bottom: 2px;
  color: #f8fafc;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.access-toast__content p {
  margin: 0;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.4;
}

@keyframes access-toast-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.page-header {
  margin-bottom: 24px;
  padding: 24px 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.14), transparent 32%),
    linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.page-header__eyebrow {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 7px 12px;
  border-radius: 999px;
  color: #1d4ed8;
  background: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 0;
  color: #111827;
  font-size: 34px;
  line-height: 1.1;
}

.page-header p {
  margin: 12px 0 0;
  max-width: 640px;
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
}

.projects-panel {
  min-height: 260px;
  padding: 22px 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.projects-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.projects-panel__header h2 {
  margin: 0;
  color: #111827;
  font-size: 20px;
}

.projects-panel__badge {
  min-width: 36px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #e0e7ff;
  color: #1d4ed8;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.projects-list {
  margin-top: 18px;
  padding: 4px 0 0;
}

.projects-list__link {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 16px;
  color: inherit;
  background: transparent;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.projects-list__link:hover {
  transform: translateX(4px);
}

.floating-actions {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  gap: 12px;
  z-index: 10;
}

.floating-actions__button {
  padding: 14px 18px;
  border: 0;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.floating-actions__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.16);
}

.floating-actions__button--primary {
  color: white;
  background: #2563eb;
}
.add-project-button {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: #111827;
  color: white;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.add-project-button:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.project-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
}

.project-modal__content {
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.3);
}

.project-modal__content h2 {
  margin: 0 0 24px;
  font-size: 24px;
  color: #111827;
}

.project-modal__content label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.project-modal__content input[type='text'],
.project-modal__content input[type='date'],
.project-modal__content textarea,
.project-modal__content select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font: inherit;
  color: #111827;
  background: white;
  outline: none;
  box-sizing: border-box;
}

.project-modal__content textarea {
  min-height: 110px;
  resize: vertical;
}

.project-modal__content input:focus,
.project-modal__content textarea:focus,
.project-modal__content select:focus {
  border-color: #111827;
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.1);
}

.project-modal__content fieldset {
  margin: 0 0 20px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.project-modal__content legend {
  padding: 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.project-modal__content fieldset label {
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-weight: 500;
  cursor: pointer;
}

.project-modal__content fieldset label:last-child {
  margin-bottom: 0;
}

.project-modal__content input[type='checkbox'] {
  width: 17px;
  height: 17px;
  cursor: pointer;
}

.form-error {
  margin: 0 0 18px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 14px;
  font-weight: 600;
}

.project-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.project-modal__actions button {
  padding: 11px 18px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.project-modal__actions button[type='button'] {
  background: #e5e7eb;
  color: #111827;
}

.project-modal__actions button[type='submit'] {
  background: #111827;
  color: white;
}

.project-modal__actions button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
