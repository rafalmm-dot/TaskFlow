<script setup>
import { computed } from 'vue'
import { tasks } from '~/data/tasks'

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
</script>

<template>
  <section v-if="task" class="task-detail">
    <div v-if="!canViewTask" class="access-toast">
      Nie jestes przypisany do tego zadania.
    </div>

    <template v-if="canViewTask">
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

@media (max-width: 720px) {
  .task-header {
    flex-direction: column;
  }

  .task-info__grid {
    grid-template-columns: 1fr;
  }
}
</style>
