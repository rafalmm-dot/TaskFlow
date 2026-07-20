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
          <span class="project-header__eyebrow">
            Projekt #{{ project.id }}
          </span>
          <h1>{{ project.title }}</h1>
          <p
            v-if="project.description"
            class="project-header__description"
          >
            {{ project.description }}
          </p>
          <p v-else class="project-header__description">
            Ten projekt nie ma jeszcze opisu.
          </p>
        </div>

        <span class="project-status">
          {{ project.status }}
        </span>
      </div>
    </section>

    <section class="project-info">
      <div class="project-info__header">
        <h2>Szczegóły projektu</h2>
      </div>

      <div class="project-info__grid">
        <div class="project-info__card">
          <span>Status</span>
          <strong>{{ project.status }}</strong>
        </div>

        <div class="project-info__card">
          <span>Termin</span>
          <strong>{{ project.deadline }}</strong>
        </div>

        <div class="project-info__card">
          <span>Data utworzenia</span>
          <strong>{{ project.createdAt }}</strong>
        </div>

        <div class="project-info__card">
          <span>Liczba osób</span>
          <strong>{{ projectUsers.length }}</strong>
        </div>
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

    <div
      v-if="loggedUser?.role === 'szef'"
      class="project-team__actions"
    >
      <button
        type="button"
        class="project-team__add-button"
        @click="openMemberForm"
      >
        Dodaj osobę
      </button>

      <button
        type="button"
        class="project-team__remove-selected-button"
        :disabled="
          isRemovingMembers ||
          selectedProjectUserIds.length === 0
        "
        @click="removeSelectedProjectMembers"
      >
        {{
          isRemovingMembers
            ? 'Usuwanie...'
            : `Usuń (${selectedProjectUserIds.length})`
        }}
      </button>
    </div>
  </div>

  <div
    v-if="projectUsers.length > 0"
    class="project-team__list"
  >
    <article
      v-for="user in projectUsers"
      :key="user.id"
      class="project-team__person"
      :class="{
        'project-team__person--selected':
          selectedProjectUserIds.includes(user.id)
      }"
    >
      <label
        v-if="isBoss"
        class="project-team__select"
      >
        <input
          v-model="selectedProjectUserIds"
          type="checkbox"
          :value="user.id"
        />
      </label>

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

  <p
    v-if="removeMemberError"
    class="form-error project-team__error"
  >
    {{ removeMemberError }}
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
    <div
  v-if="showMemberForm"
  class="member-modal"
  @click.self="closeMemberForm"
>
  <form
    class="member-modal__content"
    @submit.prevent="addProjectMember"
  >
    <div class="member-modal__header">
      <div>
        <span class="member-modal__eyebrow">
          Zespół projektu
        </span>
        <h2>Dodaj osobę do projektu</h2>
        <p>Wyszukaj pracownika i wybierz go z listy.</p>
      </div>

      <button
        type="button"
        class="member-modal__close"
        aria-label="Zamknij formularz"
        :disabled="isAddingMember"
        @click="closeMemberForm"
      >
        ×
      </button>
    </div>

    <div class="member-modal__body">
      <p v-if="usersLoading">
        Ładowanie pracowników...
      </p>

      <template v-else>
        <label class="member-modal__search">
          <span>Wyszukiwarka</span>
          <input
            v-model="memberSearch"
            type="text"
            placeholder="Wpisz imię lub nazwisko..."
          />
        </label>

        <div class="member-modal__picker">
          <h3>Osoby dostępne do przypisania</h3>

          <div
            v-if="filteredAvailableUsers.length > 0"
            class="member-modal__list"
          >
            <label
              v-for="user in filteredAvailableUsers"
              :key="user.id"
              class="member-modal__person"
              :class="{
                'member-modal__person--selected':
                  selectedUserIds.includes(user.id)
              }"
            >
              <input
                v-model="selectedUserIds"
                type="checkbox"
                :value="user.id"
              />

              <span class="member-modal__avatar">
                {{ user.name?.charAt(0) }}{{ user.surname?.charAt(0) }}
              </span>

              <span class="member-modal__person-details">
                <strong>
                  {{ user.name }} {{ user.surname }}
                </strong>

                <small>{{ user.role }}</small>
              </span>
            </label>
          </div>

          <p
            v-else-if="availableUsers.length > 0"
            class="member-modal__empty"
          >
            Nie znaleziono pracowników pasujących do wyszukiwania.
          </p>
        </div>
      </template>

      <p v-if="availableUsers.length === 0">
        Wszyscy pracownicy są już przypisani do projektu.
      </p>

      <p
        v-if="addMemberError"
        class="form-error"
      >
        {{ addMemberError }}
      </p>
    </div>

    <div class="member-modal__actions">
      <button
        type="button"
        :disabled="isAddingMember"
        @click="closeMemberForm"
      >
        Anuluj
      </button>

      <button
        type="submit"
        class="member-modal__submit"
        :disabled="
          isAddingMember ||
          availableUsers.length === 0 ||
          selectedUserIds.length === 0
        "
      >
        {{
          isAddingMember
            ? 'Dodawanie...'
            : `Dodaj osoby (${selectedUserIds.length})`
        }}
      </button>
    </div>
  </form>
</div>
  </section>

  <section v-else class="project-page">
    <h1>Nie znaleziono projektu</h1>
    <p>Projekt o takim numerze nie istnieje.</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const { loggedUser } = useAuth()
const route = useRoute()

const currentProjectId = Number(route.params.id)

const {
  data: project,
  pending: projectLoading,
  error: projectError
} = await useFetch(`/api/projects/${currentProjectId}`, {
  default: () => null
})

const {
  data: usersFromApi,
  pending: usersLoading
} = await useFetch('/api/users', {
  default: () => []
})

const showTaskForm = ref(false)
const submitError = ref('')
const isSubmitting = ref(false)

const showMemberForm = ref(false)
const selectedUserIds = ref([])
const memberSearch = ref('')
const isAddingMember = ref(false)
const addMemberError = ref('')
const selectedProjectUserIds = ref([])
const isRemovingMembers = ref(false)
const removeMemberError = ref('')

const localTasks = ref([
  ...(project.value?.tasks ?? [])
])

const isBoss = computed(() => {
  return loggedUser.value?.role === 'szef'
})

const currentWorker = computed(() => {
  if (
    !loggedUser.value ||
    loggedUser.value.role !== 'pracownik'
  ) {
    return null
  }

  return (
    project.value?.users?.find(
      (user) => user.id === loggedUser.value.id
    ) ?? null
  )
})

const taskForm = ref({
  title: '',
  description: '',
  projectId: currentProjectId,
  status: 'Do zrobienia',
  priority: 'Średni',
  deadline: '',
  assignedUserIds: []
})

const projectUsers = computed(() => {
  return project.value?.users ?? []
})

const availableUsers = computed(() => {
  const currentProjectUserIds = new Set(
    projectUsers.value.map((user) => user.id)
  )

  return (usersFromApi.value ?? []).filter(
    (user) =>
      user.role === 'pracownik' &&
      !currentProjectUserIds.has(user.id)
  )
})

const filteredAvailableUsers = computed(() => {
  const normalizedQuery =
    memberSearch.value.trim().toLocaleLowerCase()

  if (!normalizedQuery) {
    return availableUsers.value
  }

  return availableUsers.value.filter((user) => {
    const fullName = `${user.name ?? ''} ${user.surname ?? ''}`
      .trim()
      .toLocaleLowerCase()

    return fullName.includes(normalizedQuery)
  })
})

const assignableUsers = computed(() => {
  if (isBoss.value) {
    return projectUsers.value.filter(
      (user) => user.role === 'pracownik'
    )
  }

  return currentWorker.value
    ? [currentWorker.value]
    : []
})

const projectTasks = computed(() => {
  return localTasks.value
})

const canViewProject = computed(() => {
  if (!loggedUser.value || !project.value) {
    return false
  }

  if (loggedUser.value.role === 'szef') {
    return true
  }

  return (
    project.value.userIds?.includes(
      loggedUser.value.id
    ) ?? false
  )
})

function resetTaskForm() {
  taskForm.value = {
    title: '',
    description: '',
    projectId: currentProjectId,
    status: 'Do zrobienia',
    priority: 'Średni',
    deadline: '',
    assignedUserIds:
      isBoss.value || !loggedUser.value
        ? []
        : [loggedUser.value.id]
  }

  submitError.value = ''
}

function openTaskForm() {
  resetTaskForm()
  showTaskForm.value = true
}

function closeTaskForm() {
  resetTaskForm()
  showTaskForm.value = false
}

function openMemberForm() {
  selectedUserIds.value = []
  memberSearch.value = ''
  addMemberError.value = ''
  removeMemberError.value = ''
  showMemberForm.value = true
}

function closeMemberForm() {
  if (isAddingMember.value) {
    return
  }

  selectedUserIds.value = []
  memberSearch.value = ''
  addMemberError.value = ''
  showMemberForm.value = false
}

async function addProjectMember() {
  if (isAddingMember.value) {
    return
  }

  addMemberError.value = ''

  const userIds = selectedUserIds.value.filter(
    (userId) =>
      Number.isInteger(userId) && userId > 0
  )

  if (userIds.length === 0) {
    addMemberError.value = 'Wybierz przynajmniej jedną osobę.'
    return
  }

  try {
    isAddingMember.value = true

    const response = await $fetch(
      `/api/projects/${currentProjectId}/members`,
      {
        method: 'POST',
        body: {
          userIds
        }
      }
    )

    if (project.value) {
      const nextUsers = [
        ...(project.value.users ?? []),
        ...(response.users ?? [])
      ]

      const nextUserIds = [
        ...(project.value.userIds ?? []),
        ...(response.userIds ?? [])
      ]

      project.value = {
        ...project.value,
        users: nextUsers,
        userIds: nextUserIds
      }
    }

    isAddingMember.value = false
    closeMemberForm()
  } catch (error) {
    console.error(
      'Nie udało się dodać osoby do projektu:',
      error
    )

    addMemberError.value =
      error?.data?.statusMessage ??
      'Nie udało się dodać osoby do projektu.'
  } finally {
    if (isAddingMember.value) {
      isAddingMember.value = false
    }
  }
}

async function removeSelectedProjectMembers() {
  if (
    !project.value ||
    selectedProjectUserIds.value.length === 0 ||
    isRemovingMembers.value
  ) {
    return
  }

  const confirmed = window.confirm(
    `Czy na pewno chcesz usunąć ${selectedProjectUserIds.value.length} ${
      selectedProjectUserIds.value.length === 1
        ? 'osobę'
        : 'osoby'
    } z projektu?`
  )

  if (!confirmed) {
    return
  }

  try {
    isRemovingMembers.value = true
    removeMemberError.value = ''

    await $fetch(
      `/api/projects/${currentProjectId}/members`,
      {
        method: 'DELETE',
        body: {
          userIds: selectedProjectUserIds.value
        }
      }
    )

    const nextUsers = project.value.users.filter(
      (projectUser) =>
        !selectedProjectUserIds.value.includes(
          projectUser.id
        )
    )

    const nextUserIds = (
      project.value.userIds ?? []
    ).filter(
      (userId) =>
        !selectedProjectUserIds.value.includes(userId)
    )

    project.value = {
      ...project.value,
      users: nextUsers,
      userIds: nextUserIds
    }

    selectedProjectUserIds.value = []
  } catch (error) {
    console.error(
      'Nie udało się usunąć osoby z projektu:',
      error
    )

    removeMemberError.value =
      error?.data?.statusMessage ??
      'Nie udało się usunąć osoby z projektu.'
  } finally {
    isRemovingMembers.value = false
  }
}

async function submitTask() {
  const trimmedTitle =
    taskForm.value.title.trim()

  const trimmedDescription =
    taskForm.value.description.trim()

  submitError.value = ''

  if (!trimmedTitle) {
    submitError.value = 'Podaj nazwę zadania.'
    return
  }

  if (!trimmedDescription) {
    submitError.value = 'Podaj opis zadania.'
    return
  }

  if (!taskForm.value.deadline) {
    submitError.value =
      'Wybierz termin wykonania zadania.'
    return
  }

  if (!project.value || !loggedUser.value) {
    submitError.value =
      'Nie udało się odczytać projektu lub użytkownika.'
    return
  }

  const assignedUserIds = isBoss.value
    ? [...taskForm.value.assignedUserIds]
    : [loggedUser.value.id]

  if (assignedUserIds.length === 0) {
    submitError.value =
      'Przypisz przynajmniej jedną osobę.'
    return
  }

  try {
    isSubmitting.value = true

    const createdTask = await $fetch('/api/tasks', {
      method: 'POST',
      body: {
        projectId: currentProjectId,
        createdByUserId: loggedUser.value.id,
        title: trimmedTitle,
        description: trimmedDescription,
        status: taskForm.value.status,
        priority: taskForm.value.priority,
        deadline: taskForm.value.deadline,
        assignedUserIds
      }
    })

    localTasks.value.unshift(createdTask)

    closeTaskForm()
  } catch (error) {
    console.error(
      'Nie udało się utworzyć zadania:',
      error
    )

    submitError.value =
      error?.data?.statusMessage ??
      'Nie udało się utworzyć zadania. Spróbuj ponownie.'
  } finally {
    isSubmitting.value = false
  }
}
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

.project-header__eyebrow {
  display: inline-block;
  margin-bottom: 10px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
}

.project-header h1 {
  margin: 0 0 6px;
  color: #111827;
  font-size: 28px;
  line-height: 1.15;
}

.project-header p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.project-header__description {
  margin-top: 12px !important;
  max-width: 900px;
  color: #334155 !important;
  font-size: 17px !important;
  line-height: 1.6;
}

.project-info {
  margin-top: 12px;
  padding: 20px 22px;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
}

.project-info__header {
  margin-bottom: 18px;
}

.project-info__header h2 {
  margin: 0;
  color: #111827;
  font-size: 18px;
}

.project-info__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.project-info__card {
  padding: 20px 22px;
  border: 1px solid #dbe4f0;
  border-radius: 18px;
  background: #ffffff;
}

.project-info__card span {
  display: block;
  margin-bottom: 10px;
  color: #64748b;
  font-size: 13px;
}

.project-info__card strong {
  color: #111827;
  font-size: 18px;
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

.member-modal {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 18px;
  overflow-y: auto;
  background: rgba(15, 23, 42, 0.54);
  backdrop-filter: blur(7px);
}

.member-modal__content {
  width: min(100%, 760px);
  display: grid;
  gap: 16px;
  max-height: calc(100vh - 36px);
  margin: auto 0;
  padding: 20px;
  overflow: hidden;
  border: 1px solid rgba(191, 219, 254, 0.7);
  border-radius: 18px;
  background:
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.14), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.24);
}

.member-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 4px;
}

.member-modal__close {
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

.member-modal__close:hover {
  transform: translateY(-1px);
  background: #cbd5e1;
  color: #0f172a;
}

.member-modal__close:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

.member-modal__body {
  display: grid;
  gap: 16px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.member-modal__eyebrow {
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

.member-modal__content h2 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
  line-height: 1.1;
}

.member-modal__content p,
.member-modal__content label {
  color: #334155;
  font-size: 13px;
  line-height: 1.5;
}

.member-modal__content label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.member-modal__search input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
  font: inherit;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.member-modal__search input:focus {
  border-color: #60a5fa;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.15);
}

.member-modal__search {
  position: sticky;
  top: 0;
  z-index: 2;
  padding-bottom: 2px;
  background: linear-gradient(180deg, #f8fafc 0%, rgba(248, 250, 252, 0.96) 80%, rgba(248, 250, 252, 0) 100%);
}

.member-modal__picker {
  padding: 18px;
  border: 1px solid #dbeafe;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
}

.member-modal__picker h3 {
  margin: 0 0 14px;
  color: #1e3a8a;
  font-size: 15px;
}

.member-modal__list {
  display: grid;
  gap: 12px;
  max-height: 44vh;
  overflow-y: auto;
  padding-right: 6px;
}

.member-modal__list::-webkit-scrollbar,
.member-modal__body::-webkit-scrollbar {
  width: 10px;
}

.member-modal__list::-webkit-scrollbar-track,
.member-modal__body::-webkit-scrollbar-track {
  background: rgba(226, 232, 240, 0.7);
  border-radius: 999px;
}

.member-modal__list::-webkit-scrollbar-thumb,
.member-modal__body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #93c5fd 0%, #3b82f6 100%);
  border: 2px solid rgba(226, 232, 240, 0.7);
  border-radius: 999px;
}

.member-modal__list::-webkit-scrollbar-thumb:hover,
.member-modal__body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
}

.member-modal__content .member-modal__person {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border: 1px solid transparent;
  border-radius: 18px;
  background: #f8fafc;
  font-weight: 400;
  letter-spacing: normal;
  line-height: 1.4;
  text-transform: none;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.member-modal__person:hover {
  transform: translateY(-1px);
  border-color: #bfdbfe;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.08);
}

.member-modal__person--selected {
  border-color: #93c5fd;
  background: linear-gradient(180deg, #eff6ff 0%, #f8fbff 100%);
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.12);
}

.member-modal__person input {
  width: 18px;
  height: 18px;
  margin: 0;
  flex-shrink: 0;
  align-self: center;
  accent-color: #2563eb;
  cursor: pointer;
}

.member-modal__avatar {
  display: inline-flex;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #2563eb;
  background: #dbeafe;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.member-modal__person-details {
  min-width: 0;
  text-align: left;
}

.member-modal__person-details strong,
.member-modal__person-details small {
  display: block;
}

.member-modal__person-details strong {
  color: #0f172a;
  font-size: 15px;
}

.member-modal__person-details small {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
  text-transform: capitalize;
}

.member-modal__empty {
  margin: 0;
  padding: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  color: #64748b;
  background: rgba(248, 250, 252, 0.8);
  font-size: 12px;
}

.form-error {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #b91c1c;
  background: #fee2e2;
  font-size: 12px;
  font-weight: 600;
}

.member-modal__actions {
  position: sticky;
  bottom: 0;
  z-index: 3;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin: 0 -20px -20px;
  padding: 16px 20px 20px;
  padding-top: 4px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.82) 0%, #f8fafc 100%);
}

.member-modal__actions button {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.member-modal__actions button[type='button'] {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
}

.member-modal__actions button[type='button']:hover {
  transform: translateY(-1px);
  background: #f8fafc;
}

.member-modal__actions button[type='submit'] {
  border: 0;
  color: #eff6ff;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.18);
}

.member-modal__submit {
  min-width: 180px;
}

.member-modal__actions button[type='submit']:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(37, 99, 235, 0.22);
}

.member-modal__actions button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
  box-shadow: none;
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

.project-team__actions {
  display: flex;
  gap: 10px;
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

.project-team__person--selected {
  border-color: #93c5fd;
  background: linear-gradient(180deg, #eff6ff 0%, #f8fbff 100%);
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.1);
}

.project-team__select {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.project-team__select input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #2563eb;
  cursor: pointer;
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
  flex: 1;
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

.project-team__remove-selected-button {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid #fecaca;
  border-radius: 10px;
  background: #fff1f2;
  color: #be123c;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.project-team__remove-selected-button:hover {
  transform: translateY(-1px);
  background: #ffe4e6;
  box-shadow: 0 10px 18px rgba(190, 24, 93, 0.12);
}

.project-team__remove-selected-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
  box-shadow: none;
}

.project-team__error {
  margin-top: 10px;
}

@media (max-width: 720px) {
  .project-header,
  .project-team__header,
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .project-team__actions {
    width: 100%;
    flex-direction: column;
  }

  .project-team__list,
  .project-info__grid,
  .create-task-form,
  .create-task-form__people-list {
    grid-template-columns: 1fr;
  }

  .create-task-modal {
    padding: 10px;
  }

  .member-modal {
    padding: 10px;
  }

  .create-task-modal__content {
    max-height: calc(100vh - 20px);
    padding: 14px;
    border-radius: 16px;
  }

  .member-modal__content {
    max-height: calc(100vh - 20px);
    padding: 16px;
    border-radius: 16px;
  }

  .member-modal__list {
    max-height: 40vh;
  }

  .member-modal__person {
    gap: 12px;
    padding: 14px;
  }

  .member-modal__avatar {
    width: 38px;
    height: 38px;
    font-size: 14px;
  }

  .create-task-modal__header h2 {
    font-size: 20px;
  }

  .project-header h1 {
    font-size: 22px;
  }

  .project-header__description {
    font-size: 15px !important;
  }

  .create-task-modal__actions {
    flex-direction: column-reverse;
  }

  .member-modal__actions {
    flex-direction: column-reverse;
    margin: 0 -16px -16px;
    padding: 14px 16px 16px;
  }

  .create-task-modal__cancel,
  .create-task-modal__submit,
  .add-task-button {
    width: 100%;
  }

  .project-team__add-button,
  .project-team__remove-selected-button {
    width: 100%;
  }

  .member-modal__actions button {
    width: 100%;
  }
}
</style>
