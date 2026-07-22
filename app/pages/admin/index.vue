<script setup>
import { computed, ref } from 'vue'

const { loggedUser } = useAuth()

const activeTab = ref('users')

const isBoss = computed(() => {
  return loggedUser.value?.role === 'szef'
})

const adminStats = [
  {
    label: 'Użytkownicy',
    value: 13
  },
  {
    label: 'Aktywne projekty',
    value: 3
  },
  {
    label: 'Wszystkie zadania',
    value: 9
  },
  {
    label: 'Po terminie',
    value: 2
  }
]

const exampleUsers = [
  {
    id: 1,
    name: 'Rafał',
    surname: 'Matuszak',
    login: 'rafal',
    role: 'pracownik',
    status: 'Aktywny'
  },
  {
    id: 2,
    name: 'Anna',
    surname: 'Kowalska',
    login: 'anna.kowalska',
    role: 'pracownik',
    status: 'Aktywny'
  },
  {
    id: 3,
    name: 'Marek',
    surname: 'Nowak',
    login: 'marek.nowak',
    role: 'szef',
    status: 'Aktywny'
  }
]

const tabs = [
  {
    id: 'users',
    label: 'Użytkownicy'
  },
  {
    id: 'projects',
    label: 'Projekty'
  },
  {
    id: 'tasks',
    label: 'Zadania'
  },
  {
    id: 'activity',
    label: 'Aktywność'
  }
]
</script>

<template>
  <section class="admin-page">
    <div v-if="!isBoss" class="admin-access-denied">
      <h1>Brak dostępu</h1>
      <p>
        Panel administratora jest dostępny tylko dla użytkownika
        z rolą szef.
      </p>
    </div>

    <template v-else>
      <header class="admin-header">
        <div>
          <p class="admin-eyebrow">
            Zarządzanie systemem
          </p>

          <h1>Panel administratora</h1>

          <p class="admin-description">
            Zarządzaj użytkownikami, projektami, zadaniami
            i aktywnością zespołu.
          </p>
        </div>

        <button
          type="button"
          class="admin-primary-button"
        >
          Dodaj pracownika
        </button>
      </header>

      <section class="admin-stats">
        <article
          v-for="stat in adminStats"
          :key="stat.label"
          class="admin-stat-card"
        >
          <p>{{ stat.label }}</p>
          <strong>{{ stat.value }}</strong>
        </article>
      </section>

      <nav class="admin-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="admin-tab"
          :class="{
            'admin-tab--active': activeTab === tab.id
          }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </nav>

      <section class="admin-content">
        <div v-if="activeTab === 'users'">
          <div class="admin-section-header">
            <div>
              <h2>Użytkownicy</h2>
              <p>
                Lista kont pracowników i administratorów.
              </p>
            </div>

            <div class="admin-search">
              <input
                type="search"
                placeholder="Szukaj użytkownika..."
              >
            </div>
          </div>

          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Użytkownik</th>
                  <th>Login</th>
                  <th>Rola</th>
                  <th>Status</th>
                  <th>Akcje</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="user in exampleUsers"
                  :key="user.id"
                >
                  <td>
                    <div class="admin-user-cell">
                      <div class="admin-avatar">
                        {{ user.name.charAt(0) }}
                      </div>

                      <div>
                        <strong>
                          {{ user.name }} {{ user.surname }}
                        </strong>

                        <span>
                          ID: {{ user.id }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>{{ user.login }}</td>

                  <td>
                    <span class="admin-role-badge">
                      {{ user.role }}
                    </span>
                  </td>

                  <td>
                    <span class="admin-status-badge">
                      {{ user.status }}
                    </span>
                  </td>

                  <td>
                    <div class="admin-actions">
                      <button type="button">
                        Szczegóły
                      </button>

                      <button type="button">
                        Edytuj
                      </button>

                      <button
                        type="button"
                        class="admin-danger-button"
                      >
                        Dezaktywuj
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          v-else-if="activeTab === 'projects'"
          class="admin-placeholder"
        >
          <h2>Projekty</h2>
          <p>
            Tutaj później pojawi się zarządzanie projektami.
          </p>
        </div>

        <div
          v-else-if="activeTab === 'tasks'"
          class="admin-placeholder"
        >
          <h2>Zadania</h2>
          <p>
            Tutaj później pojawi się zarządzanie zadaniami.
          </p>
        </div>

        <div
          v-else
          class="admin-placeholder"
        >
          <h2>Aktywność</h2>
          <p>
            Tutaj później pojawi się historia działań użytkowników.
          </p>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.admin-page {
  min-height: 100%;
  padding: 32px;
  background: #f6f7fb;
}

.admin-access-denied {
  max-width: 640px;
  margin: 80px auto;
  padding: 32px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 16px 45px rgba(15, 23, 42, 0.08);
}

.admin-access-denied h1 {
  margin: 0 0 10px;
  color: #111827;
}

.admin-access-denied p {
  margin: 0;
  color: #6b7280;
}

.admin-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.admin-eyebrow {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
}

.admin-header h1 {
  margin: 0;
  font-size: 32px;
  color: #111827;
}

.admin-description {
  max-width: 640px;
  margin: 10px 0 0;
  color: #6b7280;
}

.admin-primary-button {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background: #111827;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.admin-primary-button:hover {
  opacity: 0.92;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.admin-stat-card {
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: white;
}

.admin-stat-card p {
  margin: 0 0 10px;
  color: #6b7280;
  font-size: 14px;
}

.admin-stat-card strong {
  font-size: 30px;
  color: #111827;
}

.admin-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  padding: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: white;
}

.admin-tab {
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
}

.admin-tab--active {
  background: #111827;
  color: white;
}

.admin-content {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: white;
}

.admin-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.admin-section-header h2 {
  margin: 0;
  color: #111827;
}

.admin-section-header p {
  margin: 6px 0 0;
  color: #6b7280;
}

.admin-search input {
  min-width: 260px;
  padding: 11px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  outline: none;
}

.admin-search input:focus {
  border-color: #111827;
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
}

.admin-table-wrapper {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  font-size: 13px;
  color: #6b7280;
}

.admin-table td {
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
  color: #374151;
}

.admin-user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-user-cell strong {
  display: block;
  color: #111827;
}

.admin-user-cell span {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  color: #9ca3af;
}

.admin-avatar {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 50%;
  background: #111827;
  color: white;
  font-weight: 700;
}

.admin-role-badge,
.admin-status-badge {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.admin-role-badge {
  background: #eef2ff;
  color: #4338ca;
}

.admin-status-badge {
  background: #ecfdf3;
  color: #15803d;
}

.admin-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.admin-actions button {
  padding: 8px 11px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
}

.admin-actions button:hover {
  background: #f9fafb;
}

.admin-actions .admin-danger-button {
  border-color: #fecaca;
  color: #b91c1c;
}

.admin-placeholder {
  padding: 52px 20px;
  text-align: center;
}

.admin-placeholder h2 {
  margin: 0 0 8px;
  color: #111827;
}

.admin-placeholder p {
  margin: 0;
  color: #6b7280;
}

@media (max-width: 1000px) {
  .admin-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-header,
  .admin-section-header {
    flex-direction: column;
  }

  .admin-search,
  .admin-search input {
    width: 100%;
  }
}
</style>