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

const isProfileModalOpen = ref(false)
const activeProfileSection = ref('account')

const profileInitials = computed(() => {
  const nameInitial =
    loggedUser.value?.name?.charAt(0)?.toUpperCase() ?? ''

  const surnameInitial =
    loggedUser.value?.surname?.charAt(0)?.toUpperCase() ?? ''

  return `${nameInitial}${surnameInitial}` || '?'
})

const profileFullName = computed(() => {
  if (!loggedUser.value) {
    return 'Użytkownik'
  }

  return `${loggedUser.value.name} ${loggedUser.value.surname}`
})

function openProfile() {
  isUserMenuOpen.value = false
  activeProfileSection.value = 'account'
  isProfileModalOpen.value = true
}

function closeProfile() {
  isProfileModalOpen.value = false
}
</script>

<template>
  <aside class="sidebar">
    <h2 class="sidebar__logo">TaskFlow</h2>

    <nav class="sidebar__nav">
      <NuxtLink
        to="/"
        class="sidebar__link"
        exact-active-class="sidebar__link--active"
      >
        Dashboard
      </NuxtLink>
      <NuxtLink
        to="/projects"
        class="sidebar__link"
        active-class="sidebar__link--active"
      >
        Projekty
      </NuxtLink>
      <NuxtLink
        to="/tasks"
        class="sidebar__link"
        active-class="sidebar__link--active"
      >
        Moje Zadania
      </NuxtLink>
    </nav>

    <div class="sidebar-user">
      <div
        v-if="loggedUser"
        class="sidebar-user__card"
      >
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
            type="button"
            class="sidebar-user__menu-item sidebar-user__menu-item--profile"
            @click="openProfile"
          >
            Mój profil
          </button>
          <button
            type="button"
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
  <div
  v-if="isProfileModalOpen"
  class="profile-overlay"
  @click.self="closeProfile"
>
  <section class="profile-window">
    <aside class="profile-sidebar">
      <div class="profile-avatar">
        {{ profileInitials }}
      </div>

      <h2>{{ profileFullName }}</h2>

      <p class="profile-login">
        {{ loggedUser?.login }}
      </p>

      <nav class="profile-menu">
        <button
          type="button"
          :class="{
            'profile-menu__item--active':
              activeProfileSection === 'account'
          }"
          class="profile-menu__item"
          @click="activeProfileSection = 'account'"
        >
          Ustawienia konta
        </button>

        <button
          type="button"
          :class="{
            'profile-menu__item--active':
              activeProfileSection === 'security'
          }"
          class="profile-menu__item"
          @click="activeProfileSection = 'security'"
        >
          Bezpieczeństwo
        </button>

        <button
          type="button"
          :class="{
            'profile-menu__item--active':
              activeProfileSection === 'role'
          }"
          class="profile-menu__item"
          @click="activeProfileSection = 'role'"
        >
          Rola i dostęp
        </button>
      </nav>
    </aside>

    <div class="profile-content">
      <header class="profile-window__header">
        <h2>Ustawienia konta</h2>

        <button
          type="button"
          class="profile-close"
          @click="closeProfile"
        >
          ×
        </button>
      </header>

      <div class="profile-window__body">
        <section
          v-if="activeProfileSection === 'account'"
          class="profile-section"
        >
          <div class="profile-section__header">
            <div>
              <h3>Dane podstawowe</h3>
              <p>Informacje przypisane do Twojego konta.</p>
            </div>
          </div>

          <div class="profile-data-grid">
            <div class="profile-data-item">
              <span>Imię i nazwisko</span>
              <strong>{{ profileFullName }}</strong>
            </div>

            <div class="profile-data-item">
              <span>Login</span>
              <strong>{{ loggedUser?.login }}</strong>
            </div>

            <div class="profile-data-item">
              <span>Rola</span>
              <strong>
                {{
                  loggedUser?.role === 'szef'
                    ? 'Administrator'
                    : 'Pracownik'
                }}
              </strong>
            </div>

            <div class="profile-data-item">
              <span>Status konta</span>
              <strong class="profile-active-status">
                Aktywne
              </strong>
            </div>
          </div>
        </section>

        <section
          v-else-if="activeProfileSection === 'security'"
          class="profile-section"
        >
          <div class="profile-section__header">
            <div>
              <h3>Hasło</h3>
              <p>Zarządzaj bezpieczeństwem swojego konta.</p>
            </div>

            <button
              type="button"
              class="profile-primary-button"
            >
              Zmień hasło
            </button>
          </div>
        </section>

        <section
          v-else
          class="profile-section"
        >
          <div class="profile-section__header">
            <div>
              <h3>Rola i dostęp</h3>
              <p>
                Informacje o poziomie uprawnień w aplikacji.
              </p>
            </div>
          </div>

          <div class="profile-role-card">
            <span>Aktualna rola</span>

            <strong>
              {{
                loggedUser?.role === 'szef'
                  ? 'Szef / administrator'
                  : 'Pracownik'
              }}
            </strong>
          </div>
        </section>
      </div>
    </div>
  </section>
</div>
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
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow:
    0 18px 34px rgba(15, 23, 42, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  transform-origin: bottom center;
}

.sidebar-user__menu-item {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 14px;
  color: #334155;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  font-weight: 700;
  font-size: 12px;
  line-height: 1.2;
  cursor: pointer;
  white-space: normal;
  word-break: normal;
  overflow-wrap: normal;
  hyphens: none;
  text-align: left;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.sidebar-user__menu-item:hover {
  transform: translateY(-1px);
  background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
  color: #0f172a;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.sidebar-user__menu-item--admin {
  position: relative;
  overflow: hidden;
  padding-left: 18px;
  color: #1d4ed8;
  background:
    linear-gradient(135deg, #eff6ff 0%, #e2e8f0 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.78),
    0 8px 18px rgba(37, 99, 235, 0.08);
  border-color: rgba(191, 219, 254, 0.95);
}

.sidebar-user__menu-item--admin:hover {
  transform: translateY(-1px);
  background:
    linear-gradient(135deg, #dbeafe 0%, #e2e8f0 100%);
  color: #1d4ed8;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    0 10px 22px rgba(37, 99, 235, 0.1);
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
  color: #dc2626;
  background: linear-gradient(180deg, #fff7f7 0%, #fff1f2 100%);
  border-color: rgba(254, 202, 202, 0.9);
}

.sidebar-user__menu-item:last-child:hover {
  background: linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%);
  color: #dc2626;
  box-shadow: 0 8px 18px rgba(239, 68, 68, 0.08);
}

.sidebar-user__menu-item--profile {
  position: relative;
  overflow: hidden;
  padding-left: 18px;
  color: #1d4ed8;
  background:
    linear-gradient(135deg, #eff6ff 0%, #e2e8f0 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.78),
    0 8px 18px rgba(37, 99, 235, 0.08);
  border-color: rgba(191, 219, 254, 0.95);
}

.sidebar-user__menu-item--profile:hover {
  transform: translateY(-1px);
  background:
    linear-gradient(135deg, #dbeafe 0%, #e2e8f0 100%);
  color: #1d4ed8;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    0 10px 22px rgba(37, 99, 235, 0.1);
}

.sidebar-user__menu-item--profile::after {
  content: '';
  position: absolute;
  inset: 10px auto 10px 0;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, #2563eb 0%, #60a5fa 100%);
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
.profile-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(3px);
}

.profile-window {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  width: min(1100px, 95vw);
  min-height: 560px;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid #dfe3ea;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.28);
}

.profile-sidebar {
  padding: 36px 28px;
  border-right: 1px solid #e5e7eb;
  background: #f8fafc;
  text-align: center;
}

.profile-avatar {
  display: grid;
  width: 82px;
  height: 82px;
  margin: 0 auto 20px;
  place-items: center;
  border-radius: 50%;
  background: #111827;
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
}

.profile-sidebar h2 {
  margin: 0;
  color: #111827;
  font-size: 22px;
}

.profile-login {
  margin: 8px 0 28px;
  color: #6b7280;
  font-size: 14px;
}

.profile-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-menu__item {
  width: 100%;
  padding: 11px 14px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #4b5563;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.profile-menu__item:hover {
  background: #eef2f7;
}

.profile-menu__item--active {
  background: #e7edf7;
  color: #111827;
}

.profile-content {
  min-width: 0;
  background: #f4f6fa;
}

.profile-window__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 78px;
  padding: 0 28px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
}

.profile-window__header h2 {
  margin: 0;
  color: #111827;
  font-size: 23px;
}

.profile-close {
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
}

.profile-window__body {
  padding: 26px;
  overflow-y: auto;
}

.profile-section {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.profile-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.profile-section__header h3 {
  margin: 0;
  color: #111827;
  font-size: 19px;
}

.profile-section__header p {
  margin: 5px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.profile-data-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.profile-data-item,
.profile-role-card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 11px;
  background: #f9fafb;
}

.profile-data-item span,
.profile-role-card span {
  display: block;
  margin-bottom: 6px;
  color: #6b7280;
  font-size: 12px;
}

.profile-data-item strong,
.profile-role-card strong {
  color: #111827;
  font-size: 14px;
}

.profile-active-status {
  color: #15803d !important;
}

.profile-primary-button {
  padding: 10px 16px;
  border: none;
  border-radius: 9px;
  background: #111827;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 850px) {
  .profile-window {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }

  .profile-sidebar {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .profile-data-grid {
    grid-template-columns: 1fr;
  }
}
</style>
