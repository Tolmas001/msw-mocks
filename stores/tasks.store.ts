import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'

export interface Task {
  Id: number
  Title: string
  Description: string
  DueDate: string
  IsCompleted: boolean
  OwnerId: number
}

export interface TasksResponse {
  data: Task[]
  total: number
  page: number
  totalPages: number
}

export interface CreateTaskPayload {
  Title: string
  Description: string
  DueDate: string
  IsCompleted: boolean
}

export const useTasksStore = defineStore('tasks', () => {
  const authStore = useAuthStore()

  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const totalPages = ref(1)
  const search = ref('')
  const sortBy = ref<'dueDate' | 'status' | 'title'>('dueDate')
  const filterStatus = ref<'all' | 'active' | 'completed'>('all')
  const limit = 5

  function getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authStore.token}`,
    }
  }

  async function fetchTasks() {
    loading.value = true
    try {
      const params = new URLSearchParams({
        search: search.value,
        status: filterStatus.value,
        sortBy: sortBy.value,
        page: String(page.value),
        limit: String(limit),
      })

      const res = await fetch(`/api/tasks?${params}`, {
        headers: { Authorization: `Bearer ${authStore.token}` },
      })

      if (res.status === 401) {
        authStore.logout()
        await navigateTo('/login')
        return
      }

      if (!res.ok) throw new Error('Ошибка загрузки задач')

      const data: TasksResponse = await res.json()
      tasks.value = data.data
      total.value = data.total
      page.value = data.page
      totalPages.value = data.totalPages
    } finally {
      loading.value = false
    }
  }

  async function createTask(payload: CreateTaskPayload): Promise<Task> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as any).message || 'Ошибка создания задачи')
    }

    const task: Task = await res.json()
    await fetchTasks()
    return task
  }

  async function updateTask(id: number, payload: Partial<CreateTaskPayload & { IsCompleted: boolean }>): Promise<Task> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as any).message || 'Ошибка обновления задачи')
    }

    const task: Task = await res.json()
    await fetchTasks()
    return task
  }

  async function deleteTask(id: number): Promise<void> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as any).message || 'Ошибка удаления задачи')
    }

    await fetchTasks()
  }

  // Can current user edit/delete this task?
  function canEdit(task: Task): boolean {
    if (!authStore.user) return false
    return task.OwnerId === authStore.user.id || authStore.isAdmin
  }

  function setPage(p: number) {
    page.value = p
    fetchTasks()
  }

  function resetPage() {
    page.value = 1
  }

  return {
    tasks,
    loading,
    total,
    page,
    totalPages,
    search,
    sortBy,
    filterStatus,
    limit,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    canEdit,
    setPage,
    resetPage,
  }
})
