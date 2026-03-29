<template>
  <div class="login-page">
    <!-- Animated background orbs -->
    <div class="orb orb-1" />
    <div class="orb orb-2" />

    <div class="login-container glass-card">
      <!-- Logo / Branding -->
      <div class="login-brand">
        <div class="brand-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        </div>
        <span class="brand-name">TaskFlow</span>
      </div>

      <h1 class="login-title">{{ isLogin ? 'Авторизация' : 'Регистрация' }}</h1>
      <p class="login-subtitle">
        {{ isLogin ? 'Войдите, чтобы управлять задачами' : 'Создайте новый аккаунт' }}
      </p>

      <form id="login-form" class="login-form" @submit.prevent="onSubmit" novalidate>
        <!-- Name (Only on register) -->
        <Transition name="slide-up">
          <div v-if="!isLogin" class="form-group">
            <label for="name-input">Имя</label>
            <div class="input-wrapper" :class="{ error: errors.name }">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                id="name-input"
                v-model="name"
                type="text"
                placeholder="Новый Пользователь"
                @blur="validateName"
              />
            </div>
            <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
          </div>
        </Transition>

        <!-- Email -->
        <div class="form-group">
          <label for="email-input">Email</label>
          <div class="input-wrapper" :class="{ error: errors.email }">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <input
              id="email-input"
              v-model="email"
              type="email"
              :placeholder="isLogin ? 'admin@test.com' : 'new@test.com'"
              autocomplete="email"
              @blur="validateEmail"
            />
          </div>
          <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password-input">Пароль</label>
          <div class="input-wrapper" :class="{ error: errors.password }">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <input
              id="password-input"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="123456"
              autocomplete="current-password"
              @blur="validatePassword"
            />
            <button
              type="button"
              class="toggle-password btn-ghost btn-icon"
              :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
        </div>

        <!-- Global API error -->
        <Transition name="slide-up">
          <div v-if="apiError" class="alert-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ apiError }}
          </div>
        </Transition>

        <button
          id="login-submit-btn"
          type="submit"
          class="btn-primary login-btn"
          :disabled="loading"
        >
          <div v-if="loading" class="spinner" />
          <span>{{ loading ? (isLogin ? 'Входим...' : 'Регистрация...') : (isLogin ? 'Войти' : 'Создать аккаунт') }}</span>
        </button>
      </form>

      <div class="toggle-mode-wrapper text-center mt-3">
        <button type="button" class="btn-ghost mode-toggle-btn" @click="toggleMode">
          {{ isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти' }}
        </button>
      </div>

      <!-- Demo credentials hint -->
      <div v-if="isLogin" class="demo-hint">
        <p class="demo-title">Демо-аккаунты (Mock):</p>
        <div class="demo-accounts">
          <button
            type="button"
            class="demo-btn"
            @click="fillDemo('admin@test.com', '123456')"
          >
            <span class="badge badge-admin">
              <img src="/admin_icon.png" width="14" height="14" alt="Admin" style="vertical-align: middle; margin-right: 2px" />
              Админ
            </span>
            admin@test.com
          </button>
          <button
            type="button"
            class="demo-btn"
            @click="fillDemo('user@test.com', '123456')"
          >
            <span class="badge badge-user">
              <img src="/user_icon.png" width="14" height="14" alt="User" style="vertical-align: middle; margin-right: 2px" />
              User
            </span>
            user@test.com
          </button>
        </div>
        <p class="demo-pass">Пароль: <code>123456</code></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)

const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const apiError = ref('')

const errors = reactive({ name: '', email: '', password: '' })

function toggleMode() {
  isLogin.value = !isLogin.value
  apiError.value = ''
  errors.name = ''
  errors.email = ''
  errors.password = ''
}

function validateName() {
  if (!isLogin.value && !name.value) {
    errors.name = 'Имя обязательно'
  } else {
    errors.name = ''
  }
}

function validateEmail() {
  if (!email.value) {
    errors.email = 'Email обязателен'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = 'Введите корректный email'
  } else {
    errors.email = ''
  }
}

function validatePassword() {
  if (!password.value) {
    errors.password = 'Пароль обязателен'
  } else if (password.value.length < 4) {
    errors.password = 'Минимум 4 символа'
  } else {
    errors.password = ''
  }
}

function fillDemo(e: string, p: string) {
  email.value = e
  password.value = p
  errors.email = ''
  errors.password = ''
  apiError.value = ''
}

async function onSubmit() {
  validateName()
  validateEmail()
  validatePassword()
  
  if (errors.email || errors.password || (!isLogin.value && errors.name)) return

  loading.value = true
  apiError.value = ''

  try {
    if (isLogin.value) {
      await authStore.login(email.value, password.value)
    } else {
      await authStore.register(name.value, email.value, password.value)
    }
    router.push('/tasks')
  } catch (e: any) {
    apiError.value = e.message || 'Ошибка сервера'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

/* Animated background orbs */
.orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  animation: float 8s ease-in-out infinite;
}
.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(108, 99, 255, 0.15), transparent);
  top: -100px;
  left: -100px;
}
.orb-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent);
  bottom: -80px;
  right: -80px;
  animation-delay: -3s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.02); }
}

.login-container {
  width: 100%;
  max-width: 440px;
  padding: 2.5rem;
  position: relative;
  z-index: 1;
}

/* Brand */
.login-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}
.brand-icon {
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: var(--shadow-accent);
}
.brand-name {
  font-size: 1.375rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff, var(--accent-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Title */
.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.375rem;
}
.login-subtitle {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

/* Input wrapper with icon */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  pointer-events: none;
  flex-shrink: 0;
}
.input-wrapper input {
  padding-left: 2.75rem;
  padding-right: 2.75rem;
}
.input-wrapper.error input {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px var(--danger-soft);
}
.toggle-password {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  padding: 6px;
  border-radius: var(--radius-sm);
}
.toggle-password:hover {
  color: var(--text-primary);
  background: var(--bg-card);
}

/* Alert */
.alert-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--danger-soft);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: var(--danger);
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

/* Login button */
.login-btn {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  margin-top: 0.25rem;
}

.mode-toggle-btn {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-decoration: underline;
}
.mode-toggle-btn:hover {
  color: var(--accent-light);
}

/* Demo hint */
.demo-hint {
  margin-top: 1.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}
.demo-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}
.demo-accounts {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.demo-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.demo-btn:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-focus);
  color: var(--text-primary);
}
.demo-pass {
  font-size: 0.8125rem;
  color: var(--text-muted);
}
.demo-pass code {
  font-family: 'JetBrains Mono', monospace;
  background: var(--bg-card);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  color: var(--accent-light);
}
</style>
