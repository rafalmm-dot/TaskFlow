<template>
<div class="card">
    <p class="card__label">{{ label }}</p>
    <strong class="card__number">{{ number }}</strong>
</div>
</template>
<script setup>
 defineProps({
    label: String,
    number: Number
 })
</script>
<style scoped>
.card {
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.card__label {
  margin: 0 0 12px;
  color: #6b7280;
  font-size: 13px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.card__number {
  color: #111827;
  font-size: 36px;
  letter-spacing: -0.03em;
}</style>
