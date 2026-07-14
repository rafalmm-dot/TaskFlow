<script setup>
const { loggedUser } = useAuth()
</script>

<template>
  <div class="app">
    <div class="layout" :class="{ 'layout--locked': !loggedUser }">
      <Sidebar />

      <main class="content">
        <NuxtPage />
      </main>
    </div>

    <LoginScreen v-if="!loggedUser" />
  </div>
</template>

<style>
html,
body {
  
  margin: 0;
  height: 100%;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

.app {
  height: 100vh;
  padding: 6px;
  font-family: Arial, sans-serif;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.1), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  overflow: hidden;
}

.layout {
  height: calc(100vh - 12px);
  padding: 8px;
  display: flex;
  align-items: stretch;
  gap: 8px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 22px;
  backdrop-filter: blur(18px);
  overflow: hidden;
}

.layout--locked {
  pointer-events: none;
  user-select: none;
}

.content {
  flex: 1;
  height: 100%;
  padding: 18px 18px 24px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.content::-webkit-scrollbar {
  width: 10px;
}

.content::-webkit-scrollbar-track {
  background: transparent;
}

.content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
  border: 2px solid #ffffff;
}

.content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
