<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  deadline: String,
  status: String
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
    <div>
      <h3 class="task__title">{{ title }}</h3>
      <p class="task__project">{{ deadline }}</p>
    </div>

    <span class="task__status" :class="statusClass">{{ status }}</span>
  </div>
</template>

<style scoped>
.task {
  padding: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border-top: 1px solid #e5e7eb;
}

.task__title {
  margin: 0 0 6px;
  color: #111827;
  font-size: 16px;
}

.task__project {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.task__status {
  padding: 6px 10px;
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
</style>
