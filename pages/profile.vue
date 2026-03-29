<template>
  <div class="profile-page">
    <header class="app-header">
      <div class="header-brand" @click="router.push('/tasks')" style="cursor: pointer">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </div>
        <span class="brand-name">Orqaga (Vazifalar)</span>
      </div>

      <div class="header-user">
        <button class="btn-ghost btn-icon logout-btn" title="Выйти" @click="logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>

    <main class="profile-main">
      <div class="tabs-wrapper">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'profile' }" 
          @click="activeTab = 'profile'"
        >
          Profil
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'settings' }" 
          @click="activeTab = 'settings'"
        >
          Sozlamalar
        </button>
      </div>

      <!-- PROFIL TAB -->
      <div v-if="activeTab === 'profile'" class="profile-card glass-card fade-in">
        <div class="profile-header">
          <div class="profile-avatar">{{ userInitial }}</div>
          <div class="profile-titles">
            <h1>{{ authStore.user?.name || authStore.user?.email }}</h1>
            <span
              class="badge"
              :class="authStore.isAdmin ? 'badge-admin' : 'badge-user'"
            >
              {{ authStore.isAdmin ? '★ System Admin' : '◎ Regular User' }}
            </span>
          </div>
        </div>
        
        <div class="divider" />
        
        <div class="profile-info-grid">
          <div class="info-group">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ authStore.user?.email }}</span>
          </div>
          <div class="info-group">
            <span class="info-label">Foydalanuvchi ID:</span>
            <span class="info-value">#{{ authStore.user?.id }}</span>
          </div>
        </div>

        <div class="divider" />

        <div v-if="authStore.isAdmin" class="role-section admin-section">
          <h3>Admin Ruxsatlari</h3>
          <p class="section-desc">Tizimdagi barcha vazifalarni o'chirish va tahrirlash huquqiga egasiz.</p>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">Tizim Statusi</div>
              <div class="stat-label text-success">Barqaror</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">Huquqlar</div>
              <div class="stat-label">To'liq boshqaruv</div>
            </div>
          </div>
        </div>

        <div v-else class="role-section user-section">
          <h3>Mening Huquqlarim</h3>
          <p class="section-desc">Siz faqat o'zingiz yaratgan vazifalarni boshqara olasiz.</p>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">Huquqlar</div>
              <div class="stat-label">Cheklangan</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">Status</div>
              <div class="stat-label text-accent">Faol foydalanuvchi</div>
            </div>
          </div>
        </div>
      </div>

      <!-- SOZLAMALAR TAB -->
      <div v-if="activeTab === 'settings'" class="settings-card glass-card fade-in">
        <h2 class="settings-title">Shaxsiy Sozlamalar</h2>
        <p class="settings-desc">O'z akkauntingiz ma'lumotlarini tahrirlang.</p>

        <form class="settings-form" @submit.prevent="saveUserSettings">
          <div class="form-group">
            <label>Ism-sharif</label>
            <input type="text" v-model="userForm.name" placeholder="Ismingizni kiriting" />
          </div>
          <div class="form-group">
            <label>Yangi Parol</label>
            <input type="password" v-model="userForm.password" placeholder="Yangi parolni kiriting (ixtiyoriy)" />
          </div>
          <button type="submit" class="btn-primary w-full" :disabled="saving">
            {{ saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash' }}
          </button>
          <p v-if="successMsg" class="text-success text-center mt-2" style="font-size: 0.85rem;">{{ successMsg }}</p>
        </form>

        <!-- ADMIN SOZLAMALARI -->
        <template v-if="authStore.isAdmin">
          <div class="divider" style="margin: 2rem 0;" />
          <h2 class="settings-title text-warning">Admin Sozlamalari (Global)</h2>
          <p class="settings-desc">Tizimni va boshqa foydalanuvchilarni boshqarish maxsus paneli.</p>

          <div class="admin-settings-block">
            <div class="admin-setting-item">
              <div class="setting-text">
                <strong>Texnik xizmat rejimi</strong>
                <span>Saytga kirishni vaqtincha to'xtatish.</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="adminSettings.maintenance" />
                <span class="slider" />
              </label>
            </div>

            <div class="admin-setting-item">
              <div class="setting-text">
                <strong>Foydalanuvchilarni ro'yxatdan o'tishi</strong>
                <span>Yangi userlar registratsiyasini yopish.</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="adminSettings.registrations" />
                <span class="slider" />
              </label>
            </div>
          </div>

          <div class="users-list-section">
            <h3>Tizimdagi Foydalanuvchilar (Mock)</h3>
            <table class="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Harakat</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>admin@test.com</td>
                  <td><span class="badge badge-admin">Admin</span></td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>user@test.com</td>
                  <td><span class="badge badge-user">User</span></td>
                  <td><button class="btn-ghost btn-icon text-danger" title="Bloklash">∅</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('profile')

const userInitial = computed(() => {
  const name = authStore.user?.name || authStore.user?.email || 'U'
  return name.charAt(0).toUpperCase()
})

// User settings form (Mock values)
const userForm = reactive({
  name: authStore.user?.name || '',
  password: ''
})

const saving = ref(false)
const successMsg = ref('')

// Admin settings toggles
const adminSettings = reactive({
  maintenance: false,
  registrations: true
})

function saveUserSettings() {
  saving.value = true
  successMsg.value = ''
  setTimeout(() => {
    // Just a mock save visual representation
    saving.value = false
    successMsg.value = 'Hamma o\'zgarishlar muvaffaqiyatli saqlandi!'
    setTimeout(() => { successMsg.value = '' }, 3000)
  }, 1000)
}

function logout() {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  authStore.initFromStorage()
  if (!authStore.isLoggedIn) {
    router.push('/login')
  } else {
    userForm.name = authStore.user?.name || ''
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: opacity var(--transition-fast);
}
.header-brand:hover {
  opacity: 0.8;
}

.brand-icon {
  width: 38px;
  height: 38px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.brand-name {
  font-size: 1.125rem;
  font-weight: 700;
}

.logout-btn {
  color: var(--text-muted);
}
.logout-btn:hover {
  color: var(--danger);
  background: var(--danger-soft);
}

.profile-main {
  max-width: 650px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 1.5rem;
}

.tabs-wrapper {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
}

.tab-btn {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  cursor: pointer;
  position: relative;
  transition: color var(--transition-fast);
}
.tab-btn:hover {
  color: var(--text-primary);
}
.tab-btn.active {
  color: var(--accent-light);
}
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -0.6rem;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent);
  border-radius: 3px 3px 0 0;
}

.profile-card, .settings-card {
  padding: 2.5rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  box-shadow: var(--shadow-accent);
}

.profile-titles h1 {
  font-size: 1.5rem;
  margin-bottom: 0.375rem;
}

.profile-info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-bottom: 1rem;
}

.info-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.info-value {
  font-weight: 500;
  color: var(--text-primary);
}

.role-section {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  margin-top: 1.5rem;
}

.admin-section {
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.15);
}

.user-section {
  background: rgba(108, 99, 255, 0.05);
  border: 1px solid rgba(108, 99, 255, 0.15);
}

.role-section h3 {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.section-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-box {
  background: var(--bg-card);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* SETTINGS TAB CSS */
.settings-title {
  font-size: 1.3rem;
  margin-bottom: 0.25rem;
}
.settings-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ADMIN SETTINGS BLOCK */
.admin-settings-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.admin-setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  padding: 1rem 1.2rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.setting-text strong {
  display: block;
  font-size: 0.95rem;
  color: var(--text-primary);
}
.setting-text span {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

/* TOGGLE SWITCH UI */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--bg-input);
  transition: .3s;
  border-radius: 24px;
  border: 1px solid var(--border);
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: var(--text-secondary);
  transition: .3s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #f59e0b;
  border-color: #f59e0b;
}
input:checked + .slider:before {
  transform: translateX(20px);
  background-color: white;
}

/* USERS TABLE */
.users-list-section {
  margin-top: 2rem;
}
.users-list-section h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
.users-table {
  width: 100%;
  border-collapse: collapse;
}
.users-table th, .users-table td {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.users-table th {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}
.users-table td {
  font-size: 0.9rem;
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
