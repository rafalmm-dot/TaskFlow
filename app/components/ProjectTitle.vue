<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  deadline: String,
  status: String,

  team: {
    type: Array,
    default: () => []
  }
})

const statusClass = computed(() => {
  if (props.status === 'Planowanie') {
    return 'task__status--todo'
  }

  if (props.status === 'Gotowe') {
    return 'task__status--done'
  }

  return 'task__status--progress'
})
</script>

<template>
  <div class="task">
  <div class="task__content">
  <h3 class="task__title">
    {{ title }}
  </h3>

  <p class="task__project">
    {{ deadline }}
  </p>

  <div class="task__team">
    <span class="task__team-label">
      Zespół:
    </span>

    <div
      v-if="team.length > 0"
      class="task__avatars"
    >
      <span
        v-for="user in team.slice(0, 3)"
        :key="user.id"
        class="task__avatar"
        :title="`${user.name} ${user.surname}`"
      >
        {{ user.name?.charAt(0) }}{{ user.surname?.charAt(0) }}
      </span>

      <span
        v-if="team.length > 3"
        class="task__avatar task__avatar--more"
      >
        +{{ team.length - 3 }}
      </span>
    </div>

    <span
      v-else
      class="task__team-empty"
    >
      Brak przypisanych osób
    </span>
  </div>
</div>
    <span class="task__status" :class="statusClass">{{ status }}</span>
  </div>
</template>

<style scoped>
.task {
  padding: 12px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border-top: 1px solid #e5e7eb;
}

.task__title {
  margin: 0 0 4px;
  color: #111827;
  font-size: 15px;
}

.task__project {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.task__status {
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
}

.task__status--progress {
  color: #92400e;
  background: #fef3c7;
}

.task__status--todo {
  color: #1e40af;
  background: #dbeafe;
}

.task__status--done {
  color: #166534;
  background: #dcfce7;
}
.task__content {
  min-width: 0;
}

.task__team {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.task__team-label {
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.task__avatars {
  display: flex;
  align-items: center;
}

.task__avatar {
  display: flex;
  width: 28px;
  height: 28px;
  margin-left: -6px;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  border-radius: 50%;
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.03em;
  box-shadow: 0 5px 12px rgba(37, 99, 235, 0.2);
}

.task__avatar:first-child {
  margin-left: 0;
}

.task__avatar--more {
  color: #475569;
  background: #e2e8f0;
  box-shadow: none;
}

.task__team-empty {
  color: #94a3b8;
  font-size: 13px;
}
</style>
