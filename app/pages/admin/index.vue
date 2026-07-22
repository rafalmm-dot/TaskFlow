<script setup>
import { computed, ref } from 'vue'

const { loggedUser } = useAuth()

const activeTab = ref('users')
const searchQuery = ref('')
const showCreateUserForm = ref(false)

const createUserForm = ref({
  name: '',
  surname: '',
  login: '',
  password: '',
  role: 'pracownik'
})
const showEditUserForm = ref(false)
const editingUserId = ref(null)
const isEditingUser = ref(false)
const editUserError = ref('')

const editUserForm = ref({
  name: '',
  surname: '',
  login: '',
  role: 'pracownik'
})

const isCreatingUser = ref(false)
const createUserError = ref('')
const createUserSuccess = ref('')

function openCreateUserForm() {
  createUserForm.value = {
    name: '',
    surname: '',
    login: '',
    password: '',
    role: 'pracownik'
  }

  createUserError.value = ''
  createUserSuccess.value = ''
  showCreateUserForm.value = true
}

function closeCreateUserForm() {
  if (isCreatingUser.value) {
    return
  }

  createUserError.value = ''
  showCreateUserForm.value = false
}

const isBoss = computed(() => {
  return loggedUser.value?.role === 'szef'
})

const {
  data: usersFromApi,
  pending: usersLoading,
  error: usersError
} = await useFetch('/api/users', {
  default: () => []
})

const {
  data: projectsFromApi,
  pending: projectsLoading,
  error: projectsError
} = await useFetch('/api/projects', {
  default: () => []
})

const {
  data: tasksFromApi,
  pending: tasksLoading,
  error: tasksError
} = await useFetch('/api/tasks', {
  default: () => []
})

const users = computed(() => {
  return usersFromApi.value ?? []
})

const projects = computed(() => {
  return projectsFromApi.value ?? []
})

const tasks = computed(() => {
  return tasksFromApi.value ?? []
})

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return users.value
  }

  return users.value.filter((user) => {
    const fullName = `${user.name ?? ''} ${user.surname ?? ''}`.toLowerCase()
    const login = String(user.login ?? '').toLowerCase()
    const role = String(user.role ?? '').toLowerCase()

    return (
      fullName.includes(query) ||
      login.includes(query) ||
      role.includes(query)
    )
  })
})

const activeProjectsCount = computed(() => {
  return projects.value.filter(
    (project) => project.status !== 'Gotowe'
  ).length
})

const overdueTasksCount = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return tasks.value.filter((task) => {
    if (!task.deadline || task.status === 'Zakończone') {
      return false
    }

    const deadline = new Date(`${task.deadline}T00:00:00`)

    return !Number.isNaN(deadline.getTime()) && deadline < today
  }).length
})

const adminStats = computed(() => [
  {
    label: 'Użytkownicy',
    value: users.value.length
  },
  {
    label: 'Aktywne projekty',
    value: activeProjectsCount.value
  },
  {
    label: 'Wszystkie zadania',
    value: tasks.value.length
  },
  {
    label: 'Po terminie',
    value: overdueTasksCount.value
  }
])

const tabs = [
  {
    id: 'users',
    label: 'Użytkownicy'
  },
  {
    id: 'projects',
    label: 'Projekty'
  },
  {
    id: 'tasks',
    label: 'Zadania'
  },
  {
    id: 'activity',
    label: 'Aktywność'
  }
]

function openProject(projectId) {
  navigateTo(`/projects/${projectId}`)
}

function openTask(taskId) {
  navigateTo(`/tasks/${taskId}`)
}

function goToProjects() {
  navigateTo('/projects')
}

function goToTasks() {
  navigateTo('/tasks')
}
async function submitCreateUser() {
  if (isCreatingUser.value) {
    return
  }

  createUserError.value = ''
  createUserSuccess.value = ''

  const payload = {
    name: createUserForm.value.name.trim(),
    surname: createUserForm.value.surname.trim(),
    login: createUserForm.value.login.trim(),
    password: createUserForm.value.password,
    role: createUserForm.value.role
  }

  if (!payload.name) {
    createUserError.value = 'Podaj imię użytkownika.'
    return
  }

  if (!payload.surname) {
    createUserError.value = 'Podaj nazwisko użytkownika.'
    return
  }

  if (!payload.login) {
    createUserError.value = 'Podaj login użytkownika.'
    return
  }

  if (payload.login.length < 3) {
    createUserError.value =
      'Login musi mieć przynajmniej 3 znaki.'
    return
  }

  if (!payload.password) {
    createUserError.value = 'Podaj hasło użytkownika.'
    return
  }

  if (payload.password.length < 8) {
    createUserError.value =
      'Hasło musi mieć przynajmniej 8 znaków.'
    return
  }

  try {
    isCreatingUser.value = true

    const createdUser = await $fetch('/api/users', {
      method: 'POST',
      body: payload
    })

    usersFromApi.value = [
      createdUser,
      ...(usersFromApi.value ?? [])
    ]

    createUserSuccess.value =
      `Konto użytkownika ${createdUser.name} ${createdUser.surname} zostało utworzone.`

    createUserForm.value = {
      name: '',
      surname: '',
      login: '',
      password: '',
      role: 'pracownik'
    }

    setTimeout(() => {
      createUserSuccess.value = ''
    }, 3000)

    showCreateUserForm.value = false
  } catch (error) {
    console.error(
      'Nie udało się utworzyć użytkownika:',
      error
    )

    createUserError.value =
      error?.data?.statusMessage ??
      'Nie udało się utworzyć użytkownika.'
  } finally {
    isCreatingUser.value = false
  }
}
function openEditUserForm(user) {
  editingUserId.value = user.id

  editUserForm.value = {
    name: user.name ?? '',
    surname: user.surname ?? '',
    login: user.login ?? '',
    role: user.role ?? 'pracownik'
  }

  editUserError.value = ''
  showEditUserForm.value = true
}

function closeEditUserForm() {
  if (isEditingUser.value) {
    return
  }

  showEditUserForm.value = false
  editingUserId.value = null
  editUserError.value = ''
}

async function submitEditUser() {
  if (
    !editingUserId.value ||
    isEditingUser.value
  ) {
    return
  }

  editUserError.value = ''

  const payload = {
    name: editUserForm.value.name.trim(),
    surname: editUserForm.value.surname.trim(),
    login: editUserForm.value.login.trim(),
    role: editUserForm.value.role
  }

  if (!payload.name) {
    editUserError.value = 'Podaj imię użytkownika.'
    return
  }

  if (!payload.surname) {
    editUserError.value = 'Podaj nazwisko użytkownika.'
    return
  }

  if (!payload.login) {
    editUserError.value = 'Podaj login użytkownika.'
    return
  }

  try {
    isEditingUser.value = true

    const updatedUser = await $fetch(
      `/api/users/${editingUserId.value}`,
      {
        method: 'PUT',
        body: payload
      }
    )

    const userIndex = usersFromApi.value.findIndex(
      (user) => user.id === updatedUser.id
    )

    if (userIndex !== -1) {
      usersFromApi.value[userIndex] = updatedUser
    }

    closeEditUserForm()
  } catch (error) {
    console.error(
      'Nie udało się edytować użytkownika:',
      error
    )

    editUserError.value =
      error?.data?.statusMessage ??
      'Nie udało się zapisać zmian.'
  } finally {
    isEditingUser.value = false
  }
}
</script>

<template>
  <section class="admin-page">
    <div v-if="!isBoss" class="admin-access-denied">
      <h1>Brak dostępu</h1>

      <p>
        Panel administratora jest dostępny tylko dla użytkownika
        z rolą szef.
      </p>
    </div>

    <template v-else>
      <header class="admin-header">
        <div>
          <p class="admin-eyebrow">
            Zarządzanie systemem
          </p>

          <h1>Panel administratora</h1>

          <p class="admin-description">
            Zarządzaj użytkownikami, projektami, zadaniami
            i aktywnością zespołu.
          </p>
        </div>

       <button
  type="button"
  class="admin-primary-button"
  @click="openCreateUserForm"
>
  Dodaj pracownika
</button>
      </header>
      <p
  v-if="createUserSuccess"
  class="admin-success-message"
>
  {{ createUserSuccess }}
</p>

      <section class="admin-stats">
        <article
          v-for="stat in adminStats"
          :key="stat.label"
          class="admin-stat-card"
        >
          <p>{{ stat.label }}</p>
          <strong>{{ stat.value }}</strong>
        </article>
      </section>

      <nav class="admin-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="admin-tab"
          :class="{
            'admin-tab--active': activeTab === tab.id
          }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </nav>

      <section class="admin-content">
        <!-- UŻYTKOWNICY -->
        <div v-if="activeTab === 'users'">
          <div class="admin-section-header">
            <div>
              <h2>Użytkownicy</h2>

              <p>
                Lista kont pracowników i administratorów.
              </p>
            </div>

            <div class="admin-search">
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Szukaj użytkownika..."
              >
            </div>
          </div>

          <p v-if="usersLoading" class="admin-info">
            Ładowanie użytkowników...
          </p>

          <p v-else-if="usersError" class="form-error">
            Nie udało się pobrać użytkowników.
          </p>

          <p
            v-else-if="filteredUsers.length === 0"
            class="admin-empty-state"
          >
            Nie znaleziono użytkowników.
          </p>

          <div
            v-else
            class="admin-table-wrapper"
          >
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Użytkownik</th>
                  <th>Login</th>
                  <th>Rola</th>
                  <th>Status</th>
                  <th>Akcje</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="user in filteredUsers"
                  :key="user.id"
                >
                  <td>
                    <div class="admin-user-cell">
                      <div class="admin-avatar">
                        {{ user.name?.charAt(0)?.toUpperCase() || '?' }}
                      </div>

                      <div>
                        <strong>
                          {{ user.name }} {{ user.surname }}
                        </strong>

                        <span>
                          ID: {{ user.id }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>{{ user.login }}</td>

                  <td>
                    <span class="admin-role-badge">
                      {{ user.role }}
                    </span>
                  </td>

                  <td>
                    <span class="admin-status-badge">
                      Aktywny
                    </span>
                  </td>

                  <td>
                    <div class="admin-actions">
                      <button type="button" disabled>
                        Szczegóły
                      </button>

                        <button
                                type="button"
                                @click="openEditUserForm(user)"
                                >
                                Edytuj
                        </button>

                      <button
                        type="button"
                        class="admin-danger-button"
                        disabled
                      >
                        Dezaktywuj
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- PROJEKTY -->
        <div v-else-if="activeTab === 'projects'">
          <div class="admin-section-header">
            <div>
              <h2>Projekty</h2>

              <p>
                Lista wszystkich projektów zapisanych w bazie danych.
              </p>
            </div>

            <button
              type="button"
              class="admin-primary-button"
              @click="goToProjects"
            >
              Dodaj projekt
            </button>
          </div>

          <p v-if="projectsLoading" class="admin-info">
            Ładowanie projektów...
          </p>

          <p v-else-if="projectsError" class="form-error">
            Nie udało się pobrać projektów.
          </p>

          <p
            v-else-if="projects.length === 0"
            class="admin-empty-state"
          >
            Brak projektów.
          </p>

          <div
            v-else
            class="admin-table-wrapper"
          >
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Projekt</th>
                  <th>Status</th>
                  <th>Termin</th>
                  <th>Zespół</th>
                  <th>Akcje</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="project in projects"
                  :key="project.id"
                >
                  <td>
                    <strong>{{ project.title }}</strong>

                    <span class="admin-description-cell">
                      {{ project.description || 'Brak opisu' }}
                    </span>
                  </td>

                  <td>
                    <span class="admin-role-badge">
                      {{ project.status }}
                    </span>
                  </td>

                  <td>{{ project.deadline }}</td>

                  <td>
                    {{ project.users?.length ?? 0 }} osób
                  </td>

                  <td>
                    <div class="admin-actions">
                      <button
                        type="button"
                        @click="openProject(project.id)"
                      >
                        Otwórz
                      </button>

                      <button
                        type="button"
                        @click="openProject(project.id)"
                      >
                        Edytuj
                      </button>

                      <button
                        type="button"
                        class="admin-danger-button"
                        disabled
                      >
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ZADANIA -->
        <div v-else-if="activeTab === 'tasks'">
          <div class="admin-section-header">
            <div>
              <h2>Zadania</h2>

              <p>
                Lista wszystkich zadań zapisanych w bazie danych.
              </p>
            </div>

            <button
              type="button"
              class="admin-primary-button"
              @click="goToTasks"
            >
              Dodaj zadanie
            </button>
          </div>

          <p v-if="tasksLoading" class="admin-info">
            Ładowanie zadań...
          </p>

          <p v-else-if="tasksError" class="form-error">
            Nie udało się pobrać zadań.
          </p>

          <p
            v-else-if="tasks.length === 0"
            class="admin-empty-state"
          >
            Brak zadań.
          </p>

          <div
            v-else
            class="admin-table-wrapper"
          >
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Zadanie</th>
                  <th>Projekt</th>
                  <th>Status</th>
                  <th>Priorytet</th>
                  <th>Termin</th>
                  <th>Przypisani</th>
                  <th>Akcje</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="task in tasks"
                  :key="task.id"
                >
                  <td>
                    <strong>{{ task.title }}</strong>

                    <span class="admin-description-cell">
                      {{ task.description || 'Brak opisu' }}
                    </span>
                  </td>

                  <td>{{ task.project }}</td>

                  <td>
                    <span class="admin-role-badge">
                      {{ task.status }}
                    </span>
                  </td>

                  <td>
                    <span class="admin-priority-badge">
                      {{ task.priority }}
                    </span>
                  </td>

                  <td>{{ task.deadline }}</td>

                  <td>
                    {{ task.assignedUsers?.length ?? 0 }} osób
                  </td>

                  <td>
                    <div class="admin-actions">
                      <button
                        type="button"
                        @click="openTask(task.id)"
                      >
                        Otwórz
                      </button>

                      <button
                        type="button"
                        @click="openTask(task.id)"
                      >
                        Edytuj
                      </button>

                      <button
                        type="button"
                        class="admin-danger-button"
                        @click="openTask(task.id)"
                      >
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        
        <div
          v-else
          class="admin-placeholder"
        >
          <h2>Aktywność</h2>

          <p>
            Tutaj później pojawi się historia działań użytkowników.
          </p>
        </div>
      </section>
    </template>
    <div
  v-if="showCreateUserForm"
  class="admin-modal"
  @click.self="closeCreateUserForm"
>
 <form
  class="admin-modal__content"
  @submit.prevent="submitCreateUser"
>
    <div class="admin-modal__header">
      <div>
        <h2>Dodaj pracownika</h2>

        <p>
          Utwórz nowe konto użytkownika.
        </p>
      </div>

      <button
        type="button"
        class="admin-modal__close"
        @click="closeCreateUserForm"
      >
        ×
      </button>
    </div>

    <label class="admin-form-field">
      Imię

      <input
        v-model="createUserForm.name"
        type="text"
        placeholder="Wpisz imię"
      >
    </label>

    <label class="admin-form-field">
      Nazwisko

      <input
        v-model="createUserForm.surname"
        type="text"
        placeholder="Wpisz nazwisko"
      >
    </label>

    <label class="admin-form-field">
      Login

      <input
        v-model="createUserForm.login"
        type="text"
        placeholder="Wpisz login"
      >
    </label>

    <label class="admin-form-field">
      Hasło początkowe

      <input
        v-model="createUserForm.password"
        type="password"
        placeholder="Wpisz hasło"
      >
    </label>

    <label class="admin-form-field">
      Rola

      <select v-model="createUserForm.role">
        <option value="pracownik">
          Pracownik
        </option>

        <option value="szef">
          Szef
        </option>
      </select>
    </label>

    <p
  v-if="createUserError"
  class="form-error"
>
  {{ createUserError }}
</p>

    <div class="admin-modal__actions">
    <button
  type="button"
  class="admin-secondary-button"
  :disabled="isCreatingUser"
  @click="closeCreateUserForm"
>
  Anuluj
</button>

     <button
  type="submit"
  class="admin-primary-button"
  :disabled="isCreatingUser"
>
  {{
    isCreatingUser
      ? 'Tworzenie konta...'
      : 'Utwórz konto'
  }}
</button>
    </div>
  </form>
</div>
<div
  v-if="showEditUserForm"
  class="admin-modal"
  @click.self="closeEditUserForm"
>
  <form
    class="admin-modal__content"
    @submit.prevent="submitEditUser"
  >
    <div class="admin-modal__header">
      <div>
        <h2>Edytuj użytkownika</h2>

        <p>
          Zmień dane konta użytkownika.
        </p>
      </div>

      <button
        type="button"
        class="admin-modal__close"
        @click="closeEditUserForm"
      >
        ×
      </button>
    </div>

    <label class="admin-form-field">
      Imię

      <input
        v-model="editUserForm.name"
        type="text"
      >
    </label>

    <label class="admin-form-field">
      Nazwisko

      <input
        v-model="editUserForm.surname"
        type="text"
      >
    </label>

    <label class="admin-form-field">
      Login

      <input
        v-model="editUserForm.login"
        type="text"
      >
    </label>

    <label class="admin-form-field">
      Rola

      <select v-model="editUserForm.role">
        <option value="pracownik">
          Pracownik
        </option>

        <option value="szef">
          Szef
        </option>
      </select>
    </label>

    <p
      v-if="editUserError"
      class="form-error"
    >
      {{ editUserError }}
    </p>

    <div class="admin-modal__actions">
      <button
        type="button"
        class="admin-secondary-button"
        :disabled="isEditingUser"
        @click="closeEditUserForm"
      >
        Anuluj
      </button>

      <button
        type="submit"
        class="admin-primary-button"
        :disabled="isEditingUser"
      >
        {{
          isEditingUser
            ? 'Zapisywanie...'
            : 'Zapisz zmiany'
        }}
      </button>
    </div>
  </form>
</div>
  </section>
</template>

<style scoped>
.admin-page {
  min-height: 100%;
  padding: 28px;
  background: #f6f7fb;
}

.admin-access-denied {
  max-width: 640px;
  margin: 80px auto;
  padding: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.admin-access-denied h1 {
  margin: 0 0 10px;
  color: #111827;
}

.admin-access-denied p {
  margin: 0;
  color: #6b7280;
}

.admin-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 26px;
}

.admin-eyebrow {
  margin: 0 0 6px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-header h1 {
  margin: 0;
  color: #111827;
  font-size: 30px;
}

.admin-description {
  max-width: 640px;
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 15px;
}

.admin-primary-button {
  flex: 0 0 auto;
  padding: 11px 18px;
  border: none;
  border-radius: 10px;
  background: #111827;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.admin-primary-button:hover:not(:disabled) {
  opacity: 0.92;
}

.admin-primary-button:disabled,
.admin-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.admin-stat-card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
}

.admin-stat-card p {
  margin: 0 0 8px;
  color: #6b7280;
  font-size: 13px;
}

.admin-stat-card strong {
  color: #111827;
  font-size: 28px;
}

.admin-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
  padding: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
}

.admin-tab {
  padding: 9px 15px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.admin-tab--active {
  background: #111827;
  color: #ffffff;
}

.admin-content {
  min-width: 0;
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.admin-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.admin-section-header h2 {
  margin: 0;
  color: #111827;
  font-size: 24px;
}

.admin-section-header p {
  margin: 5px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.admin-search input {
  width: 260px;
  max-width: 100%;
  padding: 10px 13px;
  border: 1px solid #d1d5db;
  border-radius: 9px;
  outline: none;
  font: inherit;
}

.admin-search input:focus {
  border-color: #111827;
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
}

.admin-info {
  color: #6b7280;
}

.form-error {
  padding: 12px 14px;
  border-radius: 10px;
  background: #fee2e2;
  color: #b91c1c;
}

.admin-empty-state {
  padding: 36px 20px;
  text-align: center;
  color: #6b7280;
}

.admin-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  vertical-align: top;
}

.admin-table th {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.admin-table td {
  color: #374151;
  font-size: 13px;
  line-height: 1.35;
}

.admin-table td strong {
  display: block;
  color: #374151;
  font-size: 14px;
  line-height: 1.3;
}

.admin-user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-user-cell strong {
  color: #111827;
}

.admin-user-cell span {
  display: block;
  margin-top: 2px;
  color: #9ca3af;
  font-size: 11px;
}

.admin-avatar {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 50%;
  background: #111827;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}

.admin-role-badge,
.admin-status-badge,
.admin-priority-badge {
  display: inline-flex;
  max-width: 100%;
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.admin-role-badge {
  background: #eef2ff;
  color: #4338ca;
}

.admin-status-badge {
  background: #ecfdf3;
  color: #15803d;
}

.admin-priority-badge {
  background: #fff7ed;
  color: #c2410c;
}

.admin-description-cell {
  display: -webkit-box;
  margin-top: 3px;
  overflow: hidden;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.admin-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.admin-actions button {
  width: 100%;
  min-width: 0;
  padding: 6px 7px;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  background: #ffffff;
  color: #374151;
  font-size: 11px;
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
}

.admin-actions button:hover:not(:disabled) {
  background: #f9fafb;
}

.admin-actions .admin-danger-button {
  border-color: #fecaca;
  color: #b91c1c;
}

/* Tabela użytkowników */
.admin-table--users {
  table-layout: fixed;
}

.admin-table--users th:nth-child(1),
.admin-table--users td:nth-child(1) {
  width: 30%;
}

.admin-table--users th:nth-child(2),
.admin-table--users td:nth-child(2) {
  width: 22%;
}

.admin-table--users th:nth-child(3),
.admin-table--users td:nth-child(3) {
  width: 14%;
}

.admin-table--users th:nth-child(4),
.admin-table--users td:nth-child(4) {
  width: 14%;
}

.admin-table--users th:nth-child(5),
.admin-table--users td:nth-child(5) {
  width: 20%;
}

/* Tabela projektów */
.admin-table--projects {
  table-layout: fixed;
}

.admin-table--projects th:nth-child(1),
.admin-table--projects td:nth-child(1) {
  width: 38%;
}

.admin-table--projects th:nth-child(2),
.admin-table--projects td:nth-child(2) {
  width: 16%;
}

.admin-table--projects th:nth-child(3),
.admin-table--projects td:nth-child(3) {
  width: 15%;
  white-space: nowrap;
}

.admin-table--projects th:nth-child(4),
.admin-table--projects td:nth-child(4) {
  width: 12%;
  white-space: nowrap;
}

.admin-table--projects th:nth-child(5),
.admin-table--projects td:nth-child(5) {
  width: 19%;
}

/* Kompaktowa tabela zadań — wszystkie kolumny mieszczą się w panelu */
.admin-table--tasks {
  table-layout: fixed;
}

.admin-table--tasks th:nth-child(1),
.admin-table--tasks td:nth-child(1) {
  width: 29%;
}

.admin-table--tasks th:nth-child(2),
.admin-table--tasks td:nth-child(2) {
  width: 15%;
  overflow-wrap: anywhere;
}

.admin-table--tasks th:nth-child(3),
.admin-table--tasks td:nth-child(3) {
  width: 12%;
}

.admin-table--tasks th:nth-child(4),
.admin-table--tasks td:nth-child(4) {
  width: 10%;
}

.admin-table--tasks th:nth-child(5),
.admin-table--tasks td:nth-child(5) {
  width: 11%;
  white-space: nowrap;
}

.admin-table--tasks th:nth-child(6),
.admin-table--tasks td:nth-child(6) {
  width: 9%;
  white-space: nowrap;
}

.admin-table--tasks th:nth-child(7),
.admin-table--tasks td:nth-child(7) {
  width: 14%;
}

.admin-placeholder {
  padding: 48px 20px;
  text-align: center;
}

.admin-placeholder h2 {
  margin: 0 0 8px;
  color: #111827;
}

.admin-placeholder p {
  margin: 0;
  color: #6b7280;
}
.admin-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.62);
}

.admin-modal__content {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 26px;
  border-radius: 18px;
  background: white;
}

.admin-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.admin-modal__header h2 {
  margin: 0;
  color: #111827;
}

.admin-modal__header p {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.admin-modal__close {
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}

.admin-form-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 16px;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.admin-form-field input,
.admin-form-field select {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 13px;
  border: 1px solid #d1d5db;
  border-radius: 9px;
  background: white;
  color: #111827;
  font: inherit;
  outline: none;
}

.admin-form-field input:focus,
.admin-form-field select:focus {
  border-color: #111827;
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
}

.admin-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.admin-secondary-button {
  padding: 11px 18px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 1100px) {
  .admin-page {
    padding: 20px;
  }

  .admin-content {
    padding: 18px;
  }

  .admin-table--tasks {
    min-width: 920px;
  }

  .admin-table--projects {
    min-width: 760px;
  }

  .admin-table--users {
    min-width: 760px;
  }
}

@media (max-width: 900px) {
  .admin-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-header,
  .admin-section-header {
    flex-direction: column;
  }

  .admin-search,
  .admin-search input {
    width: 100%;
  }
}

@media (max-width: 620px) {
  .admin-page {
    padding: 12px;
  }

  .admin-stats {
    grid-template-columns: 1fr;
  }

  .admin-content {
    padding: 14px;
  }

  .admin-tabs {
    flex-direction: column;
  }

  .admin-tab {
    width: 100%;
    text-align: left;
  }
}
.admin-success-message {
  margin: 0 0 20px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #ecfdf3;
  color: #15803d;
  font-size: 14px;
  font-weight: 600;
}
</style>
