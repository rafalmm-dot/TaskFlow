<template>
  <header class="topbar">
    <span class="topbar__eyebrow">Panel glowny</span>
    <h1 class="topbar__title">Dashboard</h1>
    <p class="topbar__subtitle">
      Przeglad projektow, zadan i najwazniejszych rzeczy w jednym miejscu.
    </p>
  </header>
</template>

<style scoped>
.topbar {
  margin-bottom: 40px;
  padding: 26px 30px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.16), transparent 34%),
    linear-gradient(135deg, #fbfdff 0%, #edf4ff 100%);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.05);
}

.topbar__eyebrow {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 7px 12px;
  border-radius: 999px;
  color: #1d4ed8;
  background: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.topbar__title {
  margin: 0;
  color: #111827;
  font-size: 34px;
  line-height: 1.1;
}

.topbar__subtitle {
  margin: 12px 0 0;
  max-width: 640px;
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
}
</style>
