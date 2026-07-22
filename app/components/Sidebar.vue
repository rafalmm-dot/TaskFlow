<script setup>
const isUserMenuOpen = ref(false)
const { loggedUser, logout } = useAuth()

const userInitial = computed(() => {
  if (!loggedUser.value?.name) {
    return '?'
  }

  return loggedUser.value.name.charAt(0).toUpperCase()
})

const isBoss = computed(() => {
  return loggedUser.value?.role === 'szef'
})

function openAdminPanel() {
  isUserMenuOpen.value = false
  navigateTo('/admin')
}

function handleLogout() {
  isUserMenuOpen.value = false
  logout()
}
</script>

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

    <div class="sidebar-user">
      <div v-if="loggedUser" class="sidebar-user__card">
        <div
          v-if="isUserMenuOpen"
          class="sidebar-user__menu"
        >
          <button
            v-if="isBoss"
            type="button"
            class="sidebar-user__menu-item sidebar-user__menu-item--admin"
            @click="openAdminPanel"
          >
            Panel administratora
          </button>

          <button
            class="sidebar-user__menu-item"
            @click="handleLogout"
          >
            Wyloguj
          </button>
        </div>

        <button
          type="button"
          class="sidebar-user__trigger"
          @click="isUserMenuOpen = !isUserMenuOpen"
        >
          <span class="sidebar-user__avatar">{{ userInitial }}</span>

          <span class="sidebar-user__info">
            <strong>{{ loggedUser.name }} {{ loggedUser.surname }}</strong>
            <small>{{ loggedUser.role }}</small>
          </span>
        </button>

      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 172px;
  height: 100%;
  flex-shrink: 0;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.18), transparent 26%),
    linear-gradient(180deg, #0f172a 0%, #111827 100%);
  color: white;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  overflow: visible;
}

.sidebar__logo {
  margin: 0;
  font-size: 18px;
  letter-spacing: -0.03em;
}

.sidebar__nav {
  margin-top: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.sidebar__link {
  padding: 8px 10px;
  border-radius: 8px;
  color: #cbd5e1;
  text-decoration: none;
  font-size: 12px;
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
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.22);
}

.sidebar-user {
  margin-top: auto;
  position: relative;
  z-index: 20;
}

.sidebar-user__card {
  width: 100%;
  padding: 10px;
  display: block;
  border: 0;
  border-radius: 12px;
  background: rgba(31, 41, 55, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.sidebar-user__card {
  position: relative;
}

.sidebar-user__summary {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-user__trigger {
  width: 100%;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.sidebar-user__avatar {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  font-weight: 800;
  font-size: 12px;
}

.sidebar-user__info {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-user__info strong {
  color: white;
  font-size: 12px;
}

.sidebar-user__info small {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 11px;
  text-transform: capitalize;
}

.sidebar-user__menu {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 10px);
  width: 100%;
  padding: 8px;
  display: grid;
  gap: 6px;
  border-radius: 16px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.16), transparent 42%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(17, 24, 39, 0.98) 100%);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow:
    0 24px 44px rgba(2, 6, 23, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  transform-origin: bottom center;
}

.sidebar-user__menu-item {
  width: 100%;
  padding: 12px 14px;
  border: 0;
  border-radius: 14px;
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.04);
  font-weight: 700;
  font-size: 12px;
  line-height: 1.2;
  cursor: pointer;
  white-space: normal;
  word-break: normal;
  overflow-wrap: normal;
  hyphens: none;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
  text-align: left;
}

.sidebar-user__menu-item:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

.sidebar-user__menu-item--admin {
  position: relative;
  overflow: hidden;
  padding-left: 18px;
  color: #dbeafe;
  background:
    linear-gradient(135deg, rgba(30, 64, 175, 0.34) 0%, rgba(37, 99, 235, 0.18) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 10px 24px rgba(37, 99, 235, 0.16);
}

.sidebar-user__menu-item--admin:hover {
  transform: translateY(-1px);
  background:
    linear-gradient(135deg, rgba(37, 99, 235, 0.38) 0%, rgba(59, 130, 246, 0.24) 100%);
  color: #eff6ff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 14px 30px rgba(37, 99, 235, 0.18);
}

.sidebar-user__menu-item--admin::after {
  content: '';
  position: absolute;
  inset: 10px auto 10px 0;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, #2563eb 0%, #60a5fa 100%);
}

.sidebar-user__menu-item:last-child {
  color: #fca5a5;
  background: linear-gradient(180deg, rgba(127, 29, 29, 0.28) 0%, rgba(69, 10, 10, 0.24) 100%);
}

.sidebar-user__menu-item:last-child:hover {
  background: linear-gradient(180deg, rgba(153, 27, 27, 0.34) 0%, rgba(127, 29, 29, 0.28) 100%);
  color: #fecaca;
  box-shadow: inset 0 0 0 1px rgba(248, 113, 113, 0.14);
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
