<template>
  <section class="projects-page">
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
        <NuxtLink
          v-for="project in projects"
          :key="project.id"
          :to="`/projects/${project.id}`"
          class="projects-list__link"
        >
          <ProjectTitle
            :title="project.title"
            :deadline="project.deadline"
            :status="project.status"
          />
        </NuxtLink>
      </div>
    </section>

    <div class="floating-actions">
      <button class="floating-actions__button floating-actions__button--primary">
        Dodaj projekt
      </button>
    </div>
  </section>
</template>

<script setup>
import { projects } from '~/data/projects'
</script>

<style scoped>
.projects-page {
  position: relative;
  min-height: 100%;
  padding: 8px;
  padding-bottom: 96px;
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
  border-radius: 16px;
  color: inherit;
  text-decoration: none;
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
