<template>
  <aside class="sidebar">
    <h2 class="sidebar__logo">TaskFlow</h2>

    <nav class="sidebar__nav">
      <NuxtLink to="/" class="sidebar__link" exact-active-class="sidebar__link--active">
        Dashboard
      </NuxtLink>
      <NuxtLink to="/projects" class="sidebar__link" active-class="sidebar__link--active">
        Projekty
      </NuxtLink>
      <NuxtLink to="/tasks" class="sidebar__link" active-class="sidebar__link--active">
        Moje Zadania
      </NuxtLink>
    </nav>
  </aside>
</template>
<style scoped>
.sidebar {
  width: 240px;
  height: 100%;
  flex-shrink: 0;
  padding: 32px 24px;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.18), transparent 26%),
    linear-gradient(180deg, #0f172a 0%, #111827 100%);
  color: white;
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  overflow: hidden;
}

.sidebar__logo {
  margin: 0;
  font-size: 24px;
  letter-spacing: -0.03em;
}

.sidebar__nav {
  margin-top: 36px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar__link {
  padding: 12px 14px;
  border-radius: 12px;
  color: #cbd5e1;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.sidebar__link:hover {
  color: white;
  background: rgba(37, 99, 235, 0.24);
  transform: translateX(3px);
}

.sidebar__link--active {
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.24);
}
</style>
