<script setup>
const isUserMenuOpen = ref(false)
const { loggedUser, logout } = useAuth()

const userInitial = computed(() => {
  if (!loggedUser.value?.name) {
    return '?'
  }

  return loggedUser.value.name.charAt(0).toUpperCase()
})

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
  width: 240px;
  height: 100%;
  flex-shrink: 0;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
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
  flex: 1;
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

.sidebar-user {
  margin-top: auto;
}

.sidebar-user__card {
  width: 100%;
  padding: 14px;
  display: block;
  border: 0;
  border-radius: 16px;
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
  gap: 12px;
  border: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.sidebar-user__avatar {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  font-weight: 800;
}

.sidebar-user__info {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-user__info strong {
  color: white;
  font-size: 14px;
}

.sidebar-user__info small {
  margin-top: 3px;
  color: #94a3b8;
  font-size: 12px;
  text-transform: capitalize;
}

.sidebar-user__menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  min-width: 140px;
  padding: 8px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
}

.sidebar-user__menu-item {
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 12px;
  color: #dc2626;
  background: transparent;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  text-align: left;
}

.sidebar-user__menu-item:hover {
  background: #fee2e2;
}
</style>
