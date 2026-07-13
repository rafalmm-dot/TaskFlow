<script setup>
import { computed, ref } from 'vue'
import { users } from '~/data/users'

const { login } = useAuth()

const currentMode = ref('login')

const enteredLogin = ref('')
const enteredPassword = ref('')
const loginError = ref('')

const registerForm = ref({
  name: '',
  surname: '',
  login: '',
  password: ''
})
const registerMessage = ref('')
const registerError = ref('')

const isLoginMode = computed(() => currentMode.value === 'login')

function switchMode(mode) {
  currentMode.value = mode
  loginError.value = ''
  registerError.value = ''
  registerMessage.value = ''
}

function handleLogin() {
  const foundUser = users.find(
    (user) =>
      user.login === enteredLogin.value.trim() &&
      user.password === enteredPassword.value
  )

  if (!foundUser) {
    loginError.value = 'Nieprawidlowy login lub haslo'
    return
  }

  login(foundUser)
  enteredLogin.value = ''
  enteredPassword.value = ''
  loginError.value = ''
}

function handleRegister() {
  registerError.value = ''
  registerMessage.value = ''

  const payload = {
    name: registerForm.value.name.trim(),
    surname: registerForm.value.surname.trim(),
    login: registerForm.value.login.trim(),
    password: registerForm.value.password,
    role: 'pracownik'
  }

  if (!payload.name || !payload.surname || !payload.login || !payload.password) {
    registerError.value = 'Uzupelnij wszystkie pola formularza'
    return
  }

  const loginExists = users.some((user) => user.login === payload.login)

  if (loginExists) {
    registerError.value = 'Taki login jest juz zajety'
    return
  }

  registerMessage.value =
    'Formularz dziala poprawnie. Rejestracja jest przygotowana, ale jeszcze nie zapisuje danych.'

  registerForm.value = {
    name: '',
    surname: '',
    login: '',
    password: ''
  }
}
</script>

<template>
  <div class="login-screen">
    <div class="login-screen__backdrop" />

    <section class="login-card">
      <div class="login-card__header">
        <div class="login-card__logo">TaskFlow</div>
        <h1>{{ isLoginMode ? 'Zaloguj sie' : 'Zarejestruj sie' }}</h1>
        <p>
          {{
            isLoginMode
              ? 'Zaloguj sie, aby uzyskac dostep do projektow, zadan i panelu aplikacji.'
              : 'Utworz konto uzytkownika. Formularz jest gotowy pod przyszle podlaczenie backendu.'
          }}
        </p>
      </div>

      <form v-if="isLoginMode" class="login-form" @submit.prevent="handleLogin">
        <label class="login-form__field">
          <span>Login</span>
          <input
            v-model="enteredLogin"
            type="text"
            placeholder="Wpisz login"
            autocomplete="username"
          >
        </label>

        <label class="login-form__field">
          <span>Haslo</span>
          <input
            v-model="enteredPassword"
            type="password"
            placeholder="Wpisz haslo"
            autocomplete="current-password"
          >
        </label>

        <p v-if="loginError" class="login-form__error">
          {{ loginError }}
        </p>

        <div class="login-form__actions">
          <button type="submit" class="login-form__button login-form__button--primary">
            Zaloguj sie
          </button>
          <button
            type="button"
            class="login-form__button login-form__button--secondary"
            @click="switchMode('register')"
          >
            Zarejestruj sie
          </button>
        </div>
      </form>

      <form v-else class="login-form" @submit.prevent="handleRegister">
        <label class="login-form__field">
          <span>Imie</span>
          <input
            v-model="registerForm.name"
            type="text"
            placeholder="Wpisz imie"
          >
        </label>

        <label class="login-form__field">
          <span>Nazwisko</span>
          <input
            v-model="registerForm.surname"
            type="text"
            placeholder="Wpisz nazwisko"
          >
        </label>

        <label class="login-form__field">
          <span>Login</span>
          <input
            v-model="registerForm.login"
            type="text"
            placeholder="Utworz login"
          >
        </label>

        <label class="login-form__field">
          <span>Haslo</span>
          <input
            v-model="registerForm.password"
            type="password"
            placeholder="Utworz haslo"
          >
        </label>

        <p v-if="registerError" class="login-form__error">
          {{ registerError }}
        </p>

        <p v-if="registerMessage" class="login-form__success">
          {{ registerMessage }}
        </p>

        <div class="login-form__actions">
          <button type="submit" class="login-form__button login-form__button--primary">
            Utworz konto
          </button>
          <button
            type="button"
            class="login-form__button login-form__button--secondary"
            @click="switchMode('login')"
          >
            Wroc do logowania
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.login-screen {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 24px;
}

.login-screen__backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.16), transparent 24%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.97) 0%, rgba(226, 232, 240, 0.98) 100%);
  backdrop-filter: blur(14px);
}

.login-card {
  position: relative;
  width: min(100%, 520px);
  padding: 30px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 28%),
    linear-gradient(180deg, #0f172a 0%, #111827 100%);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 28px 70px rgba(2, 6, 23, 0.38);
}

.login-card__header {
  margin-bottom: 22px;
  text-align: center;
}

.login-card__logo {
  margin-bottom: 18px;
  color: #f8fafc;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.login-card__header h1 {
  margin: 0;
  color: #f8fafc;
  font-size: 34px;
  line-height: 1.1;
}

.login-card__header p {
  margin: 12px 0 0;
  color: #94a3b8;
  line-height: 1.6;
}

.login-form {
  display: grid;
  gap: 16px;
}

.login-form__field {
  display: grid;
  gap: 8px;
}

.login-form__field span {
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 700;
}

.login-form__field input {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.72);
  color: #f8fafc;
  font: inherit;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.login-form__field input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.18);
}

.login-form__field input::placeholder {
  color: #64748b;
}

.login-form__error,
.login-form__success {
  margin: 0;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
}

.login-form__error {
  color: #b91c1c;
  background: #fee2e2;
}

.login-form__success {
  color: #166534;
  background: #dcfce7;
}

.login-form__actions {
  display: grid;
  gap: 12px;
  margin-top: 6px;
}

.login-form__button {
  width: 100%;
  padding: 13px 18px;
  border: 0;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.login-form__button--primary {
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.22);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.login-form__button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 30px rgba(37, 99, 235, 0.26);
  filter: brightness(1.03);
}

.login-form__button--secondary {
  color: #e2e8f0;
  background: rgba(148, 163, 184, 0.14);
}
</style>
