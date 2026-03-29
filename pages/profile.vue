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
      <div class="profile-card glass-card">
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

        <!--  == ADMIN PROFILE SECTION ==  -->
        <div v-if="authStore.isAdmin" class="role-section admin-section">
          <h3>Admin Panel (Faqat siz uchun)</h3>
          <p class="section-desc">Tizim bo'yicha maxsus huquqlar va statistika</p>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">Tizim Statusi</div>
              <div class="stat-label text-success">Barqaror</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">Ruxsatlar</div>
              <div class="stat-label">Hamma narsani tahrirlash</div>
            </div>
          </div>
          <button class="btn-primary mt-4 w-full" disabled>Admin sozlamalar (Tez Kunda)</button>
        </div>

        <!--  == USER PROFILE SECTION ==  -->
        <div v-else class="role-section user-section">
          <h3>Mening Profilim</h3>
          <p class="section-desc">Siz faqat o'zingiz yaratgan vazifalarni boshqara olasiz.</p>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">Ruxsatlar</div>
              <div class="stat-label">Faqat o'z vazifalari</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">Status</div>
              <div class="stat-label text-accent">Faol foydalanuvchi</div>
            </div>
          </div>
          <button class="btn-secondary mt-4 w-full" @click="router.push('/tasks')">Vazifalarimga o'tish</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const userInitial = computed(() => {
  const name = authStore.user?.name || authStore.user?.email || 'U'
  return name.charAt(0).toUpperCase()
})

function logout() {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  authStore.initFromStorage()
  if (!authStore.isLoggedIn) {
    router.push('/login')
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
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  padding: 3rem 1.5rem;
}

.profile-card {
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
</style>
