<script setup>
import { computed } from 'vue'
import { tasks } from '~/data/tasks'
import { users } from '~/data/users'

const { loggedUser } = useAuth()
const route = useRoute()
const currentTaskId = Number(route.params.id)

const task = tasks.find((taskItem) => taskItem.id === currentTaskId)

const canViewTask = computed(() => {
  if (!loggedUser.value) {
    return false
  }

  if (loggedUser.value.role === 'szef') {
    return true
  }

  return task?.assignedUserIds?.includes(loggedUser.value.id) ?? false
})
const assignedUsers = computed(() => {
  if (!task) {
    return []
  }

  return users.filter((user) =>
    task.assignedUserIds?.includes(user.id)
  )
})

const taskAuthor = computed(() => {
  if (!task) {
    return null
  }

  return users.find(
    (user) => user.id === task.createdByUserId
  )
})

const assignedPeopleCount = computed(() => {
  return assignedUsers.value.length
})
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
    >
      Edytuj
    </button>

    <button
      v-if="loggedUser?.role === 'szef'"
      type="button"
      class="task-actions__delete"
    >
      Usuń
    </button>
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
    >
      Dodaj osobę
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
</style>
