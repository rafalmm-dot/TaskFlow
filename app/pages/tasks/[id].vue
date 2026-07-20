<script setup>
import { computed, reactive, ref } from 'vue'

const { loggedUser } = useAuth()
const route = useRoute()

const currentTaskId = Number(route.params.id)

const {
  data: task,
  pending: taskLoading,
  error: taskError
} = await useFetch(`/api/tasks/${currentTaskId}`, {
  default: () => null
})

const projectMembers = ref([])

if (task.value?.projectId) {
  try {
    const project = await $fetch(
      `/api/projects/${task.value.projectId}`
    )

    projectMembers.value = project.users ?? []
  } catch (error) {
    console.error(
      'Nie udało się pobrać pracowników projektu:',
      error
    )
  }
}

const isEditing = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const deleteError = ref('')
const formError = ref('')

const form = reactive({
  title: '',
  description: '',
  status: '',
  priority: '',
  deadline: '',
  assignedUserIds: []
})

const canViewTask = computed(() => {
  if (!loggedUser.value || !task.value) {
    return false
  }

  if (loggedUser.value.role === 'szef') {
    return true
  }

  return (
    task.value.assignedUserIds?.includes(
      loggedUser.value.id
    ) ?? false
  )
})

const assignedUsers = computed(() => {
  return task.value?.assignedUsers ?? []
})

const taskAuthor = computed(() => {
  return task.value?.createdByUser ?? null
})

const assignedPeopleCount = computed(() => {
  return assignedUsers.value.length
})

const workerUsers = computed(() => {
  return projectMembers.value.filter(
    (user) => user.role === 'pracownik'
  )
})

function startEdit() {
  if (!task.value) {
    return
  }

  form.title = task.value.title
  form.description = task.value.description
  form.status = task.value.status
  form.priority = task.value.priority
  form.deadline = task.value.deadline

  form.assignedUserIds = [
    ...(task.value.assignedUserIds ?? [])
  ]

  formError.value = ''
  isEditing.value = true
}

function cancelEdit() {
  if (isSaving.value) {
    return
  }

  isEditing.value = false
  formError.value = ''
}

async function saveTask() {
  if (
    !task.value ||
    !loggedUser.value ||
    isSaving.value
  ) {
    return
  }

  formError.value = ''

  if (!form.title.trim()) {
    formError.value =
      'Tytuł zadania nie może być pusty.'
    return
  }

  if (!form.description.trim()) {
    formError.value =
      'Opis zadania nie może być pusty.'
    return
  }

  if (!form.status) {
    formError.value =
      'Wybierz status zadania.'
    return
  }

  if (!form.priority) {
    formError.value =
      'Wybierz priorytet zadania.'
    return
  }

  if (!form.deadline) {
    formError.value =
      'Wybierz termin wykonania zadania.'
    return
  }

  if (form.assignedUserIds.length === 0) {
    formError.value =
      'Przypisz przynajmniej jedną osobę.'
    return
  }

  try {
    isSaving.value = true

    const updatedTask = await $fetch(
      `/api/tasks/${currentTaskId}`,
      {
        method: 'PUT',
        body: {
          title: form.title.trim(),
          description: form.description.trim(),
          status: form.status,
          priority: form.priority,
          deadline: form.deadline,
          assignedUserIds: [
            ...form.assignedUserIds
          ]
        }
      }
    )

    Object.assign(task.value, updatedTask)

    formError.value = ''
    isEditing.value = false
  } catch (error) {
    console.error(
      'Nie udało się zapisać zadania:',
      error
    )

    formError.value =
      error?.data?.statusMessage ??
      'Nie udało się zapisać zmian w bazie danych.'
  } finally {
    isSaving.value = false
  }
}
async function deleteTask() {
  if (!task.value || isDeleting.value) {
    return
  }

  const confirmed = window.confirm(
    `Czy na pewno chcesz usunąć zadanie „${task.value.title}”?`
  )

  if (!confirmed) {
    return
  }

  try {
    isDeleting.value = true
    deleteError.value = ''

    await $fetch(`/api/tasks/${currentTaskId}`, {
      method: 'DELETE'
    })

    await navigateTo('/tasks')
  } catch (error) {
    console.error('Nie udało się usunąć zadania:', error)

    deleteError.value =
      error?.data?.statusMessage ??
      'Nie udało się usunąć zadania.'
  } finally {
    isDeleting.value = false
  }
}
</script>
<template>
  <section v-if="task" class="task-detail">
    <div v-if="!canViewTask" class="access-toast">
      Nie jestes przypisany do tego zadania.
    </div>

    <template v-if="canViewTask">
      <div class="task-actions">
  <NuxtLink to="/tasks" class="task-actions__back">
    ← Wróć do zadań
  </NuxtLink>

  <div class="task-actions__buttons">
<button
  type="button"
  class="task-actions__edit"
  @click="startEdit"
>
  Edytuj
</button>

    <button
  v-if="loggedUser?.role === 'szef'"
  type="button"
  class="delete-button"
  :disabled="isDeleting"
  @click="deleteTask"
>
  {{ isDeleting ? 'Usuwanie...' : 'Usuń zadanie' }}
</button>
<p v-if="deleteError" class="form-error">
  {{ deleteError }}
</p>
  </div>
</div>
      <section class="task-page">
        <div class="task-header">
          <div>
            <span class="task-header__project">{{ task.project }}</span>
            <h1>{{ task.title }}</h1>
            <p>{{ task.description }}</p>
          </div>

          <span
            class="task-status"
            :class="{
              'task-status--todo': task.status === 'Do zrobienia',
              'task-status--progress': task.status === 'W trakcie',
              'task-status--done': task.status === 'Zakonczone'
            }"
          >
            {{ task.status }}
          </span>
        </div>
      </section>

      <section class="task-info">
        <div class="task-info__header">
          <h2>Szczegoly zadania</h2>
        </div>

        <div class="task-info__grid">
          <div class="task-info__card">
            <span>Priorytet</span>
            <strong>{{ task.priority }}</strong>
          </div>

          <div class="task-info__card">
            <span>Termin</span>
            <strong>{{ task.deadline }}</strong>
          </div>

          <div class="task-info__card">
            <span>Data utworzenia</span>
            <strong>{{ task.createdAt }}</strong>
          </div>

          <div class="task-info__card">
            <span>ID projektu</span>
            <strong>#{{ task.projectId }}</strong>
          </div>
        </div>
      </section>
    </template>
  </section>

  <section v-else class="task-page">
    <h1>Nie znaleziono zadania</h1>
    <p>Zadanie o takim numerze nie istnieje.</p>
  </section>
  <section class="task-people">
  <div class="task-people__header">
    <div>
      <h2>Osoby przypisane do zadania</h2>
      <p>
        Liczba przypisanych osób: {{ assignedPeopleCount }}
      </p>
    </div>

    <button
      v-if="loggedUser?.role === 'szef'"
      type="button"
      class="task-people__add-button"
      @click="startEdit"
    >
      Przypisz osobę
    </button>
  </div>

  <div
    v-if="assignedUsers.length > 0"
    class="task-people__list"
  >
    <article
      v-for="user in assignedUsers"
      :key="user.id"
      class="task-person"
    >
      <div class="task-person__avatar">
        {{ user.name?.charAt(0) }}{{ user.surname?.charAt(0) }}
      </div>

      <div class="task-person__details">
        <strong>
          {{ user.name }} {{ user.surname }}
        </strong>

        <span>{{ user.role }}</span>
      </div>
    </article>
  </div>

  <p v-else class="task-people__empty">
    Do tego zadania nie przypisano jeszcze żadnej osoby.
  </p>
</section>
<section class="task-author">
  <div class="task-author__header">
    <h2>Autor zadania</h2>
  </div>

  <article v-if="taskAuthor" class="task-person">
    <div class="task-person__avatar">
      {{ taskAuthor.name?.charAt(0) }}{{ taskAuthor.surname?.charAt(0) }}
    </div>

    <div class="task-person__details">
      <strong>
        {{ taskAuthor.name }} {{ taskAuthor.surname }}
      </strong>

      <span>{{ taskAuthor.role }}</span>
    </div>
  </article>

  <p v-else class="task-people__empty">
    Nie znaleziono informacji o autorze zadania.
  </p>
</section>
<div
  v-if="isEditing"
  class="edit-modal"
  @click.self="cancelEdit"
>
  <form
    class="edit-modal__content"
    @submit.prevent="saveTask"
  >
    <div class="edit-modal__header">
      <div>
        <h2>Edytuj zadanie</h2>

        <p v-if="loggedUser?.role === 'pracownik'">
          Możesz zmienić wyłącznie status zadania.
        </p>
      </div>

      <button
        type="button"
        class="edit-modal__close"
        aria-label="Zamknij formularz"
        @click="cancelEdit"
      >
        ×
      </button>
    </div>

    <p v-if="formError" class="edit-modal__error">
      {{ formError }}
    </p>

    <div class="edit-modal__form">
      <template v-if="loggedUser?.role === 'szef'">
        <div class="edit-modal__field">
          <label for="edit-task-title">
            Tytuł zadania
          </label>

          <input
            id="edit-task-title"
            v-model="form.title"
            type="text"
          >
        </div>

        <div class="edit-modal__field edit-modal__field--full">
          <label for="edit-task-description">
            Opis zadania
          </label>

          <textarea
            id="edit-task-description"
            v-model="form.description"
            rows="6"
          ></textarea>
        </div>

        <div class="edit-modal__field">
          <label for="edit-task-priority">
            Priorytet
          </label>

          <select
            id="edit-task-priority"
            v-model="form.priority"
          >
            <option value="Niski">Niski</option>
            <option value="Średni">Średni</option>
            <option value="Wysoki">Wysoki</option>
          </select>
        </div>

        <div class="edit-modal__field">
          <label for="edit-task-deadline">
            Termin wykonania
          </label>

          <input
            id="edit-task-deadline"
            v-model="form.deadline"
            type="date"
          >
        </div>
      </template>

      <div class="edit-modal__field">
        <label for="edit-task-status">
          Status
        </label>

        <select
          id="edit-task-status"
          v-model="form.status"
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

      <fieldset
        v-if="loggedUser?.role === 'szef'"
        class="edit-modal__people"
      >
        <legend>Osoby przypisane do zadania</legend>

        <label
          v-for="user in workerUsers"
          :key="user.id"
          class="edit-modal__person"
        >
          <input
            v-model="form.assignedUserIds"
            type="checkbox"
            :value="user.id"
          >

          <span class="edit-modal__avatar">
            {{ user.name?.charAt(0) }}{{ user.surname?.charAt(0) }}
          </span>

          <span>
            <strong>
              {{ user.name }} {{ user.surname }}
            </strong>

            <small>{{ user.role }}</small>
          </span>
        </label>
      </fieldset>
    </div>

    <div class="edit-modal__actions">
      <button
        type="button"
        class="edit-modal__cancel"
        @click="cancelEdit"
      >
        Anuluj
      </button>

      <button
        type="submit"
        class="edit-modal__save"
      >
        Zapisz zmiany
      </button>
    </div>
  </form>
</div>
</template>

<style scoped>
.task-detail {
  position: relative;
}

.task-page {
  padding: 8px;
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
  justify-content: center;
  border-radius: 20px;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow:
    0 22px 50px rgba(15, 23, 42, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
}

.task-header {
  padding: 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.task-header__project {
  display: inline-flex;
  margin-bottom: 12px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
}

.task-header h1 {
  margin: 0 0 10px;
  color: #111827;
}

.task-header p {
  margin: 0;
  max-width: 720px;
  color: #64748b;
  line-height: 1.7;
}

.task-status {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.task-status--todo {
  color: #92400e;
  background: #fef3c7;
}

.task-status--progress {
  color: #1d4ed8;
  background: #dbeafe;
}

.task-status--done {
  color: #166534;
  background: #dcfce7;
}

.task-info {
  margin-top: 24px;
  padding: 22px 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.task-info__header {
  margin-bottom: 18px;
}

.task-info__header h2 {
  margin: 0;
  color: #111827;
  font-size: 20px;
}

.task-info__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.task-info__card {
  padding: 18px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.task-info__card span {
  display: block;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 13px;
}

.task-info__card strong {
  color: #111827;
  font-size: 16px;
}

.task-people,
.task-author {
  margin-top: 24px;
  padding: 22px 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.task-people__header,
.task-author__header {
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.task-people__header h2,
.task-author__header h2 {
  margin: 0;
  color: #111827;
  font-size: 20px;
}

.task-people__header p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 14px;
}

.task-people__add-button {
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

.task-people__add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(37, 99, 235, 0.24);
  filter: brightness(1.03);
}

.task-people__list {
  display: grid;
  gap: 14px;
}

.task-person {
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.task-person__avatar {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.2);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.task-person__details {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.task-person__details strong {
  color: #111827;
  font-size: 15px;
}

.task-person__details span {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
  text-transform: capitalize;
}

.task-people__empty {
  margin: 0;
  padding: 18px;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  color: #64748b;
  background: rgba(255, 255, 255, 0.8);
}

@media (max-width: 720px) {
  .task-header {
    flex-direction: column;
  }

  .task-info__grid {
    grid-template-columns: 1fr;
  }

  .task-people__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
.task-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding: 8px;
}

.task-actions__back {
  color: #475569;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.task-actions__back:hover {
  color: #2563eb;
}

.task-actions__buttons {
  display: flex;
  gap: 10px;
}

.task-actions__edit,
.task-actions__delete {
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.task-actions__edit {
  border: none;
  color: #ffffff;
  background: #2563eb;
}

.task-actions__edit:hover {
  background: #1d4ed8;
}

.task-actions__delete {
  border: 1px solid #fecaca;
  color: #dc2626;
  background: #ffffff;
}

.task-actions__delete:hover {
  background: #fef2f2;
}
.edit-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 24px;

  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(5px);
}

.edit-modal__content {
  width: 100%;
  max-width: 760px;
  max-height: calc(100vh - 48px);

  padding: 26px;
  overflow-y: auto;

  border-radius: 24px;
  background: #ffffff;

  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.3);
}

.edit-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;

  margin-bottom: 22px;
}

.edit-modal__header h2 {
  margin: 0;

  color: #111827;
  font-size: 24px;
}

.edit-modal__header p {
  margin: 7px 0 0;

  color: #64748b;
  font-size: 14px;
}

.edit-modal__close {
  display: flex;
  width: 38px;
  height: 38px;
  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 50%;

  color: #475569;
  background: #f1f5f9;

  font-size: 25px;
  cursor: pointer;
}

.edit-modal__close:hover {
  color: #111827;
  background: #e2e8f0;
}

.edit-modal__error {
  margin: 0 0 20px;
  padding: 12px 14px;

  border: 1px solid #fecaca;
  border-radius: 12px;

  color: #b91c1c;
  background: #fef2f2;

  font-size: 14px;
}

.edit-modal__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.edit-modal__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-modal__field--full {
  grid-column: 1 / -1;
}

.edit-modal__field label,
.edit-modal__people legend {
  color: #334155;
  font-size: 14px;
  font-weight: 700;
}

.edit-modal__field input,
.edit-modal__field textarea,
.edit-modal__field select {
  width: 100%;
  box-sizing: border-box;

  padding: 12px 14px;

  border: 1px solid #cbd5e1;
  border-radius: 12px;

  color: #111827;
  background: #ffffff;

  font: inherit;
  outline: none;
}

.edit-modal__field input:focus,
.edit-modal__field textarea:focus,
.edit-modal__field select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.edit-modal__field textarea {
  min-height: 130px;
  resize: vertical;
  line-height: 1.6;
}

.edit-modal__people {
  grid-column: 1 / -1;

  margin: 0;
  padding: 18px;

  border: 1px solid #e2e8f0;
  border-radius: 16px;
}

.edit-modal__people legend {
  padding: 0 7px;
}

.edit-modal__person {
  display: flex;
  align-items: center;
  gap: 12px;

  margin-top: 12px;
  padding: 12px;

  border-radius: 12px;
  background: #f8fafc;

  cursor: pointer;
}

.edit-modal__person:hover {
  background: #f1f5f9;
}

.edit-modal__person input {
  width: 18px;
  height: 18px;

  accent-color: #2563eb;
  cursor: pointer;
}

.edit-modal__avatar {
  display: flex;
  width: 38px;
  height: 38px;
  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  color: #1d4ed8;
  background: #dbeafe;

  font-size: 12px;
  font-weight: 800;
}

.edit-modal__person strong,
.edit-modal__person small {
  display: block;
}

.edit-modal__person strong {
  color: #111827;
}

.edit-modal__person small {
  margin-top: 3px;

  color: #64748b;
  text-transform: capitalize;
}

.edit-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  margin-top: 24px;
}

.edit-modal__cancel,
.edit-modal__save {
  padding: 11px 18px;

  border-radius: 12px;

  font-weight: 700;
  cursor: pointer;
}

.edit-modal__cancel {
  border: 1px solid #cbd5e1;

  color: #475569;
  background: #ffffff;
}

.edit-modal__cancel:hover {
  background: #f8fafc;
}

.edit-modal__save {
  border: none;

  color: #ffffff;
  background: #2563eb;
}

.edit-modal__save:hover {
  background: #1d4ed8;
}
</style>
