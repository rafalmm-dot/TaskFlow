<script setup>
import { computed, ref } from 'vue'
import { tasks } from '~/data/tasks'

const { loggedUser } = useAuth()
const accessToast = ref('')

const visibleTasks = computed(() => {
  if (!loggedUser.value) {
    return []
  }

  if (loggedUser.value.role === 'szef') {
    return tasks
  }

  return tasks.filter((task) => task.assignedUserIds?.includes(loggedUser.value.id))
})

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
        <h2>
          {{ loggedUser?.role === 'szef' ? 'Wszystkie zadania' : 'Lista zadan' }}
        </h2>

        <span class="tasks-panel__badge">
          {{ visibleTasks.length }}
          {{ visibleTasks.length === 1 ? 'zadanie' : 'zadan' }}
        </span>
      </div>

      <div v-if="visibleTasks.length > 0" class="tasks-list">
        <button
          v-for="task in visibleTasks"
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
                  'task-card__status--todo': task.status === 'Do zrobienia',
                  'task-card__status--progress': task.status === 'W trakcie',
                  'task-card__status--done': task.status === 'Zakonczone'
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
        <p class="tasks-empty__title">
          Nie masz jeszcze przypisanych zadan.
        </p>

        <p class="tasks-empty__text">
          Nowe zadania pojawia sie tutaj po przypisaniu ich do Twojego konta.
        </p>
      </div>
    </section>

    <div class="floating-actions">
      <button class="floating-actions__button floating-actions__button--secondary">
        Przypisz zadanie
      </button>
      <button class="floating-actions__button floating-actions__button--primary">
        Stworz zadanie
      </button>
    </div>
  </section>
</template>

<style scoped>
.tasks-page {
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

.tasks-panel {
  min-height: 260px;
  padding: 22px 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.tasks-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
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

.floating-actions__button--secondary {
  color: #0f172a;
  background: #ffffff;
}

.floating-actions__button--primary {
  color: white;
  background: #2563eb;
}

@media (max-width: 640px) {
  .task-card__top {
    align-items: flex-start;
    flex-direction: column;
  }

  .task-card__details {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
