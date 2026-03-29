<template>
  <div class="tasks-page">
    <!-- Sidebar/Header section -->
    <header class="app-header">
      <div class="header-brand">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        </div>
        <span class="brand-name">TaskFlow</span>
      </div>

      <div class="header-user">
        <div class="user-info">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-details">
            <span class="user-name">{{ authStore.user?.name || authStore.user?.email }}</span>
            <span
              class="badge"
              :class="authStore.isAdmin ? 'badge-admin' : 'badge-user'"
            >
              {{ authStore.isAdmin ? '★ Admin' : '◎ User' }}
            </span>
          </div>
        </div>
        <button id="logout-btn" class="btn-ghost btn-icon logout-btn" title="Выйти" @click="logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Main content -->
    <main class="tasks-main">
      <!-- Page title + Add button -->
      <div class="page-top">
        <div>
          <h1 class="page-title">Мои задачи</h1>
          <p class="page-subtitle">{{ tasksStore.total }} задач{{ tasksStore.total === 1 ? 'а' : tasksStore.total < 5 ? 'и' : '' }} всего</p>
        </div>
        <button id="add-task-btn" class="btn-primary add-btn" @click="showAdd = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Добавить задачу
        </button>
      </div>

      <!-- Search + Sort + Filter toolbar -->
      <div class="toolbar">
        <!-- Search -->
        <div class="search-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            id="search-input"
            v-model="searchInput"
            type="text"
            placeholder="Поиск задач..."
            class="search-input"
          />
          <button
            v-if="searchInput"
            class="search-clear btn-ghost btn-icon"
            @click="clearSearch"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div v-if="searchInput && debouncing" class="search-spinner">
            <div class="spinner spinner-accent" style="width:14px;height:14px" />
          </div>
        </div>

        <!-- Sort -->
        <div class="select-wrapper">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="select-icon">
            <line x1="12" y1="20" x2="12" y2="4"/>
            <polyline points="6 10 12 4 18 10"/>
          </svg>
          <select id="sort-select" v-model="tasksStore.sortBy" @change="onParamChange" class="toolbar-select">
            <option value="dueDate">По дате</option>
            <option value="status">По статусу</option>
            <option value="title">По названию</option>
          </select>
        </div>
      </div>

      <!-- Status filter tabs -->
      <div class="filter-tabs" role="tablist" aria-label="Фильтр по статусу">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          :id="`filter-tab-${tab.value}`"
          role="tab"
          :aria-selected="tasksStore.filterStatus === tab.value"
          class="filter-tab"
          :class="{ active: tasksStore.filterStatus === tab.value }"
          @click="setFilter(tab.value)"
        >
          <span class="tab-dot" :class="`dot-${tab.value}`" />
          {{ tab.label }}
          <span v-if="tab.value === 'all'" class="tab-count">{{ tasksStore.total }}</span>
        </button>
      </div>

      <!-- Task list -->
      <div class="tasks-area">
        <!-- Skeleton loading -->
        <template v-if="tasksStore.loading">
          <SkeletonCard v-for="i in 4" :key="i" />
        </template>

        <!-- Empty state -->
        <template v-else-if="tasksStore.tasks.length === 0">
          <div class="empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3 v-if="tasksStore.search">Ничего не найдено</h3>
            <h3 v-else>Задач нет</h3>
            <p v-if="tasksStore.search">По запросу «{{ tasksStore.search }}» задачи не найдены</p>
            <p v-else-if="tasksStore.filterStatus !== 'all'">В этой категории нет задач</p>
            <p v-else>Создайте первую задачу, нажав «Добавить задачу»</p>
            <button v-if="tasksStore.search" class="btn-secondary mt-4" @click="clearSearch">
              Сбросить поиск
            </button>
            <button v-else class="btn-primary mt-4" @click="showAdd = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Добавить задачу
            </button>
          </div>
        </template>

        <!-- Task cards -->
        <template v-else>
          <TransitionGroup name="slide-up" tag="div" class="task-list">
            <TaskCard
              v-for="task in tasksStore.tasks"
              :key="task.Id"
              :task="task"
              :can-edit="tasksStore.canEdit(task)"
              :owned-by-me="task.OwnerId === authStore.user?.id"
              @edit="editTask"
              @delete="confirmDelete"
              @toggle="toggleTask"
            />
          </TransitionGroup>
        </template>
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="!tasksStore.loading"
        :current-page="tasksStore.page"
        :total-pages="tasksStore.totalPages"
        :total="tasksStore.total"
        :limit="tasksStore.limit"
        @change="tasksStore.setPage"
      />
    </main>

    <!-- Delete confirmation dialog -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deleteId !== null" class="modal-overlay" @click.self="deleteId = null">
          <Transition name="modal" appear>
            <div class="confirm-dialog glass-card">
              <div class="confirm-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </div>
              <h3>Удалить задачу?</h3>
              <p>Это действие невозможно отменить.</p>
              <div class="confirm-actions">
                <button class="btn-secondary" @click="deleteId = null">Отмена</button>
                <button id="confirm-delete-btn" class="btn-primary btn-danger-primary" :disabled="deleting" @click="doDelete">
                  <div v-if="deleting" class="spinner" />
                  <span>{{ deleting ? 'Удаление...' : 'Удалить' }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Modals -->
    <Transition name="fade">
      <AddTaskModal v-if="showAdd" @close="showAdd = false" @created="onCreated" />
    </Transition>
    <Transition name="fade">
      <EditTaskModal v-if="editingTask" :task="editingTask" @close="editingTask = null" @updated="onUpdated" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth.store'
import { useTasksStore } from '~/stores/tasks.store'
import type { Task } from '~/stores/tasks.store'
import TaskCard from '~/components/TaskCard.vue'
import SkeletonCard from '~/components/SkeletonCard.vue'
import Pagination from '~/components/Pagination.vue'
import AddTaskModal from '~/components/AddTaskModal.vue'
import EditTaskModal from '~/components/EditTaskModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const tasksStore = useTasksStore()

const showAdd = ref(false)
const editingTask = ref<Task | null>(null)
const deleteId = ref<number | null>(null)
const deleting = ref(false)
const debouncing = ref(false)

// Search with debounce
const searchInput = ref('')
let debounceTimer: ReturnType<typeof setTimeout>

watch(searchInput, (val) => {
  debouncing.value = true
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    tasksStore.search = val
    tasksStore.resetPage()
    await tasksStore.fetchTasks()
    debouncing.value = false
  }, 350)
})

const filterTabs = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
] as const

const userInitial = computed(() => {
  const name = authStore.user?.name || authStore.user?.email || 'U'
  return name.charAt(0).toUpperCase()
})

async function setFilter(value: 'all' | 'active' | 'completed') {
  tasksStore.filterStatus = value
  tasksStore.resetPage()
  await tasksStore.fetchTasks()
}

async function onParamChange() {
  tasksStore.resetPage()
  await tasksStore.fetchTasks()
}

function clearSearch() {
  searchInput.value = ''
  tasksStore.search = ''
  tasksStore.resetPage()
  tasksStore.fetchTasks()
  debouncing.value = false
}

function editTask(task: Task) {
  editingTask.value = { ...task }
}

function confirmDelete(id: number) {
  deleteId.value = id
}

async function doDelete() {
  if (deleteId.value === null) return
  deleting.value = true
  try {
    await tasksStore.deleteTask(deleteId.value)
    deleteId.value = null
  } catch (e: any) {
    alert(e.message || 'Ошибка удаления')
  } finally {
    deleting.value = false
  }
}

async function toggleTask(task: Task) {
  await tasksStore.updateTask(task.Id, {
    Title: task.Title,
    Description: task.Description,
    DueDate: task.DueDate,
    IsCompleted: !task.IsCompleted,
  })
}

function onCreated() {
  tasksStore.fetchTasks()
}

function onUpdated() {
  tasksStore.fetchTasks()
}

function logout() {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  authStore.initFromStorage()
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  await tasksStore.fetchTasks()
})
</script>

<style scoped>
.tasks-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* === Header === */
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
}

.brand-icon {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.brand-name {
  font-size: 1.125rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff, var(--accent-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1;
}

.logout-btn {
  color: var(--text-muted);
}
.logout-btn:hover {
  color: var(--danger);
  background: var(--danger-soft);
}

/* === Main === */
.tasks-main {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 1.5rem 3rem;
}

/* Page top */
.page-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.add-btn {
  flex-shrink: 0;
  white-space: nowrap;
}

/* Toolbar */
.toolbar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.search-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  pointer-events: none;
}
.search-input {
  padding-left: 2.75rem;
  padding-right: 2.5rem;
  background: var(--bg-card);
  border-color: var(--border);
}
.search-input:focus {
  border-color: var(--border-focus);
}
.search-clear {
  position: absolute;
  right: 8px;
  color: var(--text-muted);
}
.search-clear:hover {
  color: var(--text-primary);
}
.search-spinner {
  position: absolute;
  right: 10px;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.select-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
  pointer-events: none;
  z-index: 1;
}
.toolbar-select {
  width: auto;
  min-width: 160px;
  padding-left: 2.25rem;
  background: var(--bg-card);
  border-color: var(--border);
}

/* Filter tabs */
.filter-tabs {
  display: flex;
  gap: 0.375rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 0.25rem;
  margin-bottom: 1.5rem;
}

.filter-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.filter-tab:hover {
  color: var(--text-primary);
  background: var(--bg-card-hover);
}
.filter-tab.active {
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  color: #fff;
  box-shadow: 0 2px 8px var(--accent-glow);
}

.tab-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-all { background: var(--text-muted); }
.dot-active { background: var(--success); }
.dot-completed { background: var(--accent); }
.filter-tab.active .tab-dot {
  background: rgba(255, 255, 255, 0.6);
}

.tab-count {
  background: rgba(255,255,255,0.15);
  border-radius: 999px;
  padding: 0.05rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
}
.filter-tab:not(.active) .tab-count {
  background: var(--bg-base);
  color: var(--text-muted);
}

/* Tasks area */
.tasks-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: var(--bg-card-hover);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  max-width: 280px;
}

/* Delete confirm dialog */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 1.5rem;
}

.confirm-dialog {
  width: 100%;
  max-width: 360px;
  padding: 2rem;
  text-align: center;
}

.confirm-icon {
  width: 56px;
  height: 56px;
  background: var(--danger-soft);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--danger);
  margin: 0 auto 1.25rem;
}

.confirm-dialog h3 {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.confirm-dialog p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-danger-primary {
  background: linear-gradient(135deg, var(--danger), #dc2626);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}
.btn-danger-primary:hover:not(:disabled) {
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}
</style>
