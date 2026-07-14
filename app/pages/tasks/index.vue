<script setup>
import { computed, ref } from 'vue'
import { projects } from '~/data/projects'
import { tasks } from '~/data/tasks'
import { users } from '~/data/users'

const { loggedUser } = useAuth()
const accessToast = ref('')
const searchQuery = ref('')
const selectedStatus = ref('Wszystkie')
const selectedPriority = ref('Wszystkie')
const selectedSort = ref('deadlineAsc')

const showCreateTaskForm = ref(false)

const workerUsers = users.filter(
  (user) => user.role === 'pracownik'
)
const isBoss = computed(() => loggedUser.value?.role === 'szef')
const currentWorker = computed(() => {
  if (!loggedUser.value || loggedUser.value.role !== 'pracownik') {
    return null
  }

  return users.find((user) => user.id === loggedUser.value.id) ?? null
})
const availableProjects = computed(() => {
  if (!loggedUser.value) {
    return []
  }

  if (isBoss.value) {
    return projects
  }

  return projects.filter((project) =>
    project.userIds?.includes(loggedUser.value.id)
  )
})

function openCreateTaskForm() {
  showCreateTaskForm.value = true
}

function closeCreateTaskForm() {
  showCreateTaskForm.value = false
}

 const normalizeText = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .toLowerCase()

const visibleTasks = computed(() => {
  if (!loggedUser.value) {
    return []
  }

  if (loggedUser.value.role === 'szef') {
    return tasks
  }

  return tasks.filter((task) => task.assignedUserIds?.includes(loggedUser.value.id))
})

const filteredTasks = computed(() => {
  const query = normalizeText(searchQuery.value.trim())

  return visibleTasks.value.filter((task) => {
    const matchesSearch =
      !query ||
      normalizeText(task.title).includes(query) ||
      normalizeText(task.description).includes(query) ||
      normalizeText(task.project).includes(query)

    const matchesStatus =
  selectedStatus.value === 'Wszystkie' ||
  normalizeText(task.status) === normalizeText(selectedStatus.value)

const matchesPriority =
  selectedPriority.value === 'Wszystkie' ||
  normalizeText(task.priority) === normalizeText(selectedPriority.value)

    return matchesSearch && matchesStatus && matchesPriority
  })
})
function clearFilters() {
  searchQuery.value = ''
  selectedStatus.value = 'Wszystkie'
  selectedPriority.value = 'Wszystkie'
}

function canViewTask(task) {
  if (!loggedUser.value) {
    return false
  }

  if (loggedUser.value.role === 'szef') {
    return true
  }

  return task.assignedUserIds?.includes(loggedUser.value.id) ?? false
}

function openTask(task) {
  if (canViewTask(task)) {
    navigateTo(`/tasks/${task.id}`)
    return
  }

  accessToast.value = 'Nie jestes przypisany do tego zadania.'

  setTimeout(() => {
    if (accessToast.value) {
      accessToast.value = ''
    }
  }, 3000)
}
</script>

<template>
  <section class="tasks-page">
    <div v-if="accessToast" class="access-toast" role="alert" aria-live="polite">
      <span class="access-toast__accent" />
      <div class="access-toast__content">
        <strong>Brak dostepu</strong>
        <p>{{ accessToast }}</p>
      </div>
    </div>

    <div class="page-header">
      <span class="page-header__eyebrow">Panel glowny</span>
      <h1>Moje zadania</h1>
      <p>W tym miejscu znajdziesz zadania przypisane do Ciebie.</p>
    </div>

    <section class="tasks-panel">

      <div class="tasks-panel__header">
        <div class="tasks-filters">
  <div class="tasks-filters__search">
    <label for="task-search">
      Wyszukaj zadanie
    </label>

    <input
      id="task-search"
      v-model="searchQuery"
      type="search"
      placeholder="Wpisz nazwę zadania, projektu lub fragment opisu"
    >
  </div>

  <div class="tasks-filters__field">
    <label for="task-status-filter">
      Status
    </label>

    <select
      id="task-status-filter"
      v-model="selectedStatus"
    >
      <option value="Wszystkie">Wszystkie</option>
      <option value="Do zrobienia">Do zrobienia</option>
      <option value="W trakcie">W trakcie</option>
      <option value="Zakończone">Zakończone</option>
    </select>
  </div>

  <div class="tasks-filters__field">
    <label for="task-priority-filter">
      Priorytet
    </label>

    <select
      id="task-priority-filter"
      v-model="selectedPriority"
    >
      <option value="Wszystkie">Wszystkie</option>
      <option value="Niski">Niski</option>
      <option value="Średni">Średni</option>
      <option value="Wysoki">Wysoki</option>
    </select>
  </div>

  <button
    type="button"
    class="tasks-filters__clear"
    @click="clearFilters"
  >
    Wyczyść filtry
  </button>
</div>
        <h2>
          {{ loggedUser?.role === 'szef' ? 'Wszystkie zadania' : 'Lista zadan' }}
        </h2>

        <span class="tasks-panel__badge">
          {{filteredTasks.length }}
          {{ filteredTasks.length === 1 ? 'zadanie' : 'zadan' }}
        </span>
      </div>



      <div v-if="filteredTasks.length > 0" class="tasks-list">
        <button
          v-for="task in filteredTasks"
          :key="task.id"
          type="button"
          class="task-card"
          @click="openTask(task)"
        >
          <div class="task-card__content">
            <div class="task-card__top">
              <span class="task-card__project">
                {{ task.project }}
              </span>

              <span
                class="task-card__status"
                :class="{
                  'task-card__status--todo': normalizeText(task.status) === 'do zrobienia',
                  'task-card__status--progress': normalizeText(task.status) === 'w trakcie',
                  'task-card__status--done': normalizeText(task.status) === 'zakonczone'
                }"
              >
                {{ task.status }}
              </span>
            </div>

            <h3>{{ task.title }}</h3>

            <p class="task-card__description">
              {{ task.description }}
            </p>

            <div class="task-card__details">
              <span>
                Priorytet:
                <strong>{{ task.priority }}</strong>
              </span>

              <span>
                Termin:
                <strong>{{ task.deadline }}</strong>
              </span>
            </div>
          </div>
        </button>
      </div>

      <div v-else class="tasks-empty">
  <template v-if="visibleTasks.length === 0">
    <p class="tasks-empty__title">
      Nie masz jeszcze przypisanych zadań.
    </p>

    <p class="tasks-empty__text">
      Nowe zadania pojawią się tutaj po przypisaniu ich do Twojego konta.
    </p>
  </template>

  <template v-else>
    <p class="tasks-empty__title">
      Nie znaleziono pasujących zadań.
    </p>

    <p class="tasks-empty__text">
      Zmień wpisaną frazę albo wybrane filtry.
    </p>

    <button
      type="button"
      class="tasks-empty__clear"
      @click="clearFilters"
    >
      Wyczyść filtry
    </button>
  </template>
</div>
    </section>

    <div 
    v-if="loggedUser"
    class="floating-actions">
      <button
      @click="openCreateTaskForm"
       class="floating-actions__button floating-actions__button--primary">
        Stwórz zadanie
      </button>
    </div>
    <div
  v-if="showCreateTaskForm"
  class="create-task-modal"
  @click.self="closeCreateTaskForm"
>
  <form
    class="create-task-modal__content"
    @submit.prevent
  >
    <div class="create-task-modal__header">
      <div>
        <span class="create-task-modal__eyebrow">
          Nowe zadanie
        </span>

        <h2>Stwórz zadanie</h2>

        <p>
          Uzupełnij informacje dotyczące nowego zadania.
        </p>
      </div>

      <button
        type="button"
        class="create-task-modal__close"
        aria-label="Zamknij formularz"
        @click="closeCreateTaskForm"
      >
        ×
      </button>
    </div>

    <div class="create-task-form">
      <div class="create-task-form__field create-task-form__field--full">
        <label for="new-task-title">
          Nazwa zadania
        </label>

        <input
          id="new-task-title"
          name="title"
          type="text"
          placeholder="Np. Przygotowanie projektu strony głównej"
        >
      </div>

      <div class="create-task-form__field create-task-form__field--full">
        <label for="new-task-description">
          Dokładny opis zadania
        </label>

        <textarea
          id="new-task-description"
          name="description"
          rows="6"
          placeholder="Opisz zakres zadania, wymagania i oczekiwany rezultat..."
        ></textarea>

        <small>
          Opis powinien dokładnie wyjaśniać, co należy wykonać.
        </small>
      </div>

      <div class="create-task-form__field">
        <label for="new-task-project">
          Projekt
        </label>

        <select
          id="new-task-project"
          name="projectId"
        >
          <option value="" selected disabled>
            Wybierz projekt
          </option>

          <option
            v-for="project in availableProjects"
            :key="project.id"
            :value="project.id"
          >
            {{ project.title }}
          </option>
        </select>
      </div>

      <div class="create-task-form__field">
        <label for="new-task-status">
          Status początkowy
        </label>

        <select
          id="new-task-status"
          name="status"
        >
          <option value="Do zrobienia">
            Do zrobienia
          </option>

          <option value="W trakcie">
            W trakcie
          </option>

          <option value="Zakończone">
            Zakończone
          </option>
        </select>
      </div>

      <div class="create-task-form__field">
        <label for="new-task-priority">
          Priorytet
        </label>

        <select
          id="new-task-priority"
          name="priority"
        >
          <option value="Niski">Niski</option>
          <option value="Średni" selected>Średni</option>
          <option value="Wysoki">Wysoki</option>
        </select>
      </div>

      <div class="create-task-form__field">
        <label for="new-task-deadline">
          Termin wykonania
        </label>

        <input
          id="new-task-deadline"
          name="deadline"
          type="date"
        >
      </div>

      <fieldset class="create-task-form__people">
        <legend>Osoby przypisane do zadania</legend>

        <p
          v-if="isBoss"
          class="create-task-form__people-description"
        >
          Możesz zaznaczyć kilku pracowników.
        </p>

        <p
          v-else
          class="create-task-form__people-description"
        >
          Jako pracownik możesz przypisać to zadanie tylko do siebie.
        </p>

        <div class="create-task-form__people-list">
          <label
            v-for="user in (isBoss ? workerUsers : currentWorker ? [currentWorker] : [])"
            :key="user.id"
            class="create-task-form__person"
          >
            <input
              name="assignedUserIds"
              type="checkbox"
              :value="user.id"
              :checked="!isBoss"
              :disabled="!isBoss"
            >

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
    </div>

    <div class="create-task-modal__actions">
      <button
        type="button"
        class="create-task-modal__cancel"
        @click="closeCreateTaskForm"
      >
        Anuluj
      </button>

      <button
        type="button"
        class="create-task-modal__submit"
      >
        Utwórz zadanie
      </button>
    </div>
  </form>
</div>
  </section>
</template>

<style scoped>
.tasks-page {
  position: relative;
  min-height: 100%;
  padding: 6px;
  padding-bottom: 76px;
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

.tasks-panel {
  min-height: 260px;
  padding: 22px 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.tasks-panel__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.tasks-filters {
  display: grid;
  grid-template-columns: minmax(240px, 1.4fr) repeat(2, minmax(160px, 0.8fr)) auto;
  width: 100%;
  gap: 14px;
  margin-bottom: 4px;
  padding: 18px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(239, 246, 255, 0.96) 0%, rgba(248, 250, 252, 0.96) 100%);
}

.tasks-filters__search,
.tasks-filters__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tasks-filters label {
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tasks-filters input,
.tasks-filters select {
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.tasks-filters input::placeholder {
  color: #94a3b8;
}

.tasks-filters input:focus,
.tasks-filters select:focus {
  outline: none;
  border-color: #60a5fa;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.16);
}

.tasks-filters__clear {
  align-self: end;
  min-height: 46px;
  padding: 0 18px;
  border: 0;
  border-radius: 14px;
  background: #0f172a;
  color: #f8fafc;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.tasks-filters__clear:hover {
  transform: translateY(-1px);
  background: #1e293b;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.14);
}

.tasks-filters__clear:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.22);
  outline-offset: 3px;
}

.tasks-panel__header h2 {
  margin: 0;
  color: #111827;
  font-size: 20px;
}

.tasks-panel__badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: #e0e7ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tasks-list {
  display: grid;
  gap: 16px;
  margin-top: 20px;
}

.task-card {
  width: 100%;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
}

.task-card:focus {
  outline: 3px solid rgba(37, 99, 235, 0.25);
  outline-offset: 3px;
}

.task-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.task-card__project {
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.task-card h3 {
  margin: 14px 0 8px;
  color: #111827;
  font-size: 18px;
}

.task-card__description {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.task-card__details {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 16px;
  color: #64748b;
  font-size: 13px;
}

.task-card__details strong {
  color: #334155;
}

.task-card__status {
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.task-card__status--todo {
  color: #92400e;
  background: #fef3c7;
}

.task-card__status--progress {
  color: #1d4ed8;
  background: #dbeafe;
}

.task-card__status--done {
  color: #166534;
  background: #dcfce7;
}

.tasks-empty {
  margin-top: 20px;
  padding: 22px 24px;
  border: 1px dashed #cbd5e1;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
}

.tasks-empty__title {
  margin: 0 0 10px;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
}

.tasks-empty__text {
  margin: 0;
  max-width: 560px;
  color: #64748b;
  line-height: 1.6;
}

.tasks-empty__clear {
  margin-top: 18px;
  padding: 12px 18px;
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #eff6ff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.16);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.tasks-empty__clear:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
  box-shadow: 0 16px 28px rgba(37, 99, 235, 0.2);
}

.tasks-empty__clear:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.2);
  outline-offset: 3px;
}

.create-task-modal {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: rgba(15, 23, 42, 0.54);
  backdrop-filter: blur(7px);
}

.create-task-modal__content {
  width: min(100%, 920px);
  max-height: calc(100vh - 56px);
  padding: 30px;
  overflow-y: auto;
  border: 1px solid rgba(191, 219, 254, 0.7);
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.14), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 36px 90px rgba(15, 23, 42, 0.28);
}

.create-task-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.create-task-modal__eyebrow {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 7px 12px;
  border-radius: 999px;
  color: #1d4ed8;
  background: rgba(219, 234, 254, 0.8);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.create-task-modal__header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 30px;
  line-height: 1.1;
}

.create-task-modal__header p {
  margin: 10px 0 0;
  max-width: 560px;
  color: #64748b;
  line-height: 1.6;
}

.create-task-modal__close {
  display: inline-flex;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 14px;
  background: #e2e8f0;
  color: #334155;
  font-size: 24px;
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
  gap: 18px;
}

.create-task-form__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.create-task-form__field--full,
.create-task-form__people {
  grid-column: 1 / -1;
}

.create-task-form__field label,
.create-task-form__people legend {
  color: #334155;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.create-task-form__field input,
.create-task-form__field textarea,
.create-task-form__field select {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
  font: inherit;
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
  min-height: 150px;
  resize: vertical;
  line-height: 1.6;
}

.create-task-form__field small,
.create-task-form__people-description,
.create-task-form__person small {
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.create-task-form__people {
  margin: 0;
  padding: 20px;
  border: 1px solid #dbeafe;
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.9);
}

.create-task-form__people legend {
  padding: 0 8px;
}

.create-task-form__people-description {
  margin: 0 0 16px;
}

.create-task-form__people-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.create-task-form__person {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
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
  width: 18px;
  height: 18px;
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
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #1d4ed8;
  background: #dbeafe;
  font-size: 12px;
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
  gap: 12px;
  margin-top: 26px;
}

.create-task-modal__cancel,
.create-task-modal__submit {
  min-height: 48px;
  padding: 0 18px;
  border-radius: 14px;
  font-size: 14px;
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
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.2);
}

.create-task-modal__submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 32px rgba(37, 99, 235, 0.24);
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

@media (max-width: 640px) {
  .create-task-modal {
    padding: 14px;
  }

  .create-task-modal__content {
    max-height: calc(100vh - 28px);
    padding: 20px;
    border-radius: 22px;
  }

  .create-task-modal__header h2 {
    font-size: 24px;
  }

  .create-task-form,
  .create-task-form__people-list {
    grid-template-columns: 1fr;
  }

  .create-task-modal__actions {
    flex-direction: column-reverse;
  }

  .create-task-modal__cancel,
  .create-task-modal__submit {
    width: 100%;
  }

  .tasks-panel {
    padding: 18px;
  }

  .tasks-filters {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .tasks-filters__clear {
    width: 100%;
  }

  .task-card__top {
    align-items: flex-start;
    flex-direction: column;
  }

  .task-card__details {
    flex-direction: column;
    gap: 8px;
  }
}

@media (min-width: 641px) and (max-width: 980px) {
  .create-task-modal__content {
    width: min(100%, 820px);
  }

  .create-task-form__people-list {
    grid-template-columns: 1fr;
  }

  .tasks-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tasks-filters__search {
    grid-column: 1 / -1;
  }
}
</style>
