import { http, HttpResponse } from 'msw'
import { tasks } from '../data/tasks.data'
import type { Task } from '../data/tasks.data'
import { getUserFromAuthHeader } from '../utils/auth'

let lastId = tasks.length

export const taskHandlers = [
  // GET /api/tasks — list with search, filter, sort, pagination
  http.get('/api/tasks', async ({ request }) => {
    const auth = request.headers.get('authorization')
    const user = getUserFromAuthHeader(auth)
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })

    await new Promise(resolve => setTimeout(resolve, 400))

    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const status = url.searchParams.get('status') || 'all'  // 'all' | 'active' | 'completed'
    const sortBy = url.searchParams.get('sortBy') || 'dueDate'  // 'dueDate' | 'status' | 'title'
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '5', 10)

    let result = [...tasks]

    // Search filter
    if (search) {
      result = result.filter(t =>
        t.Title.toLowerCase().includes(search) ||
        t.Description.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (status === 'active') result = result.filter(t => !t.IsCompleted)
    if (status === 'completed') result = result.filter(t => t.IsCompleted)

    // Sort
    if (sortBy === 'dueDate') {
      result.sort((a, b) => new Date(a.DueDate).getTime() - new Date(b.DueDate).getTime())
    } else if (sortBy === 'status') {
      result.sort((a, b) => Number(a.IsCompleted) - Number(b.IsCompleted))
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.Title.localeCompare(b.Title))
    }

    const total = result.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const paginated = result.slice((safePage - 1) * limit, safePage * limit)

    return HttpResponse.json({
      data: paginated,
      total,
      page: safePage,
      totalPages,
    })
  }),

  // POST /api/tasks — create a new task
  http.post('/api/tasks', async ({ request }) => {
    const auth = request.headers.get('authorization')
    const user = getUserFromAuthHeader(auth)
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as Partial<Task>

    if (!body.Title?.trim()) {
      return HttpResponse.json({ message: 'Заголовок обязателен' }, { status: 400 })
    }
    if (!body.DueDate) {
      return HttpResponse.json({ message: 'Дедлайн обязателен' }, { status: 400 })
    }

    await new Promise(resolve => setTimeout(resolve, 400))

    const task: Task = {
      Id: ++lastId,
      Title: body.Title.trim(),
      Description: body.Description?.trim() || '',
      DueDate: body.DueDate,
      IsCompleted: body.IsCompleted ?? false,
      OwnerId: user.id,
    }

    tasks.push(task)
    return HttpResponse.json(task, { status: 201 })
  }),

  // PUT /api/tasks/:id — update a task
  http.put('/api/tasks/:id', async ({ request, params }) => {
    const auth = request.headers.get('authorization')
    const user = getUserFromAuthHeader(auth)
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const id = Number(params.id)
    const taskIndex = tasks.findIndex(t => t.Id === id)

    if (taskIndex === -1) {
      return HttpResponse.json({ message: 'Задача не найдена' }, { status: 404 })
    }

    const task = tasks[taskIndex]

    // Only owner or admin can edit
    if (task.OwnerId !== user.id && user.role !== 'admin') {
      return HttpResponse.json({ message: 'Нет доступа' }, { status: 403 })
    }

    const body = await request.json() as Partial<Task>

    await new Promise(resolve => setTimeout(resolve, 300))

    tasks[taskIndex] = {
      ...task,
      Title: body.Title?.trim() || task.Title,
      Description: body.Description?.trim() ?? task.Description,
      DueDate: body.DueDate || task.DueDate,
      IsCompleted: body.IsCompleted ?? task.IsCompleted,
    }

    return HttpResponse.json(tasks[taskIndex])
  }),

  // DELETE /api/tasks/:id — delete a task
  http.delete('/api/tasks/:id', async ({ request, params }) => {
    const auth = request.headers.get('authorization')
    const user = getUserFromAuthHeader(auth)
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const id = Number(params.id)
    const taskIndex = tasks.findIndex(t => t.Id === id)

    if (taskIndex === -1) {
      return HttpResponse.json({ message: 'Задача не найдена' }, { status: 404 })
    }

    const task = tasks[taskIndex]

    // Only owner or admin can delete
    if (task.OwnerId !== user.id && user.role !== 'admin') {
      return HttpResponse.json({ message: 'Нет доступа' }, { status: 403 })
    }

    await new Promise(resolve => setTimeout(resolve, 300))

    tasks.splice(taskIndex, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
