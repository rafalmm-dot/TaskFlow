<template>
  <section class="tasks-page">
    <div class="page-header">
      <span class="page-header__eyebrow">Panel glowny</span>
      <h1>Moje zadania</h1>
      <p>W tym miejscu pojawi sie lista zadan przypisanych do Ciebie.</p>
    </div>

    <section class="tasks-panel">
      <div class="tasks-panel__header">
        <h2>Lista zadan</h2>
        <span class="tasks-panel__badge">W przygotowaniu</span>
      </div>

      <div class="tasks-empty">
        <p class="tasks-empty__title">Na razie nie ma tu jeszcze zadnych pozycji.</p>
        <p class="tasks-empty__text">
          To miejsce zostawiamy pod Twoje przyszle zadania i przypisane elementy.
        </p>
      </div>
    </section>

    <div class="floating-actions">
      <button class="floating-actions__button floating-actions__button--secondary">
        Przypisz zadanie
      </button>
      <button class="floating-actions__button floating-actions__button--primary">
        Stworz zadanie
      </button>
    </div>
  </section>
</template>

<style scoped>
.tasks-page {
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

.tasks-panel {
  min-height: 260px;
  padding: 22px 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.tasks-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.tasks-panel__header h2 {
  margin: 0;
  color: #111827;
  font-size: 20px;
}

.tasks-panel__badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: #e0e7ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tasks-empty {
  margin-top: 20px;
  padding: 22px 24px;
  border: 1px dashed #cbd5e1;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
}

.tasks-empty__title {
  margin: 0 0 10px;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
}

.tasks-empty__text {
  margin: 0;
  max-width: 560px;
  color: #64748b;
  line-height: 1.6;
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

.floating-actions__button--secondary {
  color: #0f172a;
  background: #ffffff;
}

.floating-actions__button--primary {
  color: white;
  background: #2563eb;
}
</style>
