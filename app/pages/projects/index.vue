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
       class="floating-actions__button floating-actions__button--primary">
        Dodaj projekt
      </button>
    </div>
  </section>
</template>

<script setup>
const { loggedUser } = useAuth()
const accessToast = ref('')

import { projects } from '~/data/projects'
import { users } from '~/data/users'

function getProjectUsers(project) {
  return users.filter((user) =>
    project.userIds?.includes(user.id)
  )
}

function canViewProject(project) {
  if (!loggedUser.value) {
    return false
  }

  if (loggedUser.value.role === 'szef') {
    return true
  }

  return project.userIds?.includes(loggedUser.value.id) ?? false
}

function openProject(project) {
  if (canViewProject(project)) {
    navigateTo(`/projects/${project.id}`)
    return
  }

  accessToast.value = 'Nie jestes przypisany do tego projektu.'

  setTimeout(() => {
    if (accessToast.value) {
      accessToast.value = ''
    }
  }, 3000)
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
</style>
