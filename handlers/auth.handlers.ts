import { http, HttpResponse } from 'msw'
import { users } from '../data/users.data'
import { encodeToken } from '../utils/auth'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string }
    const { email, password } = body

    if (!email || !password) {
      return HttpResponse.json(
        { message: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600))

    const user = users.find(u => u.email === email && u.password === password)

    if (!user) {
      return HttpResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      )
    }

    const token = encodeToken({ id: user.id, email: user.email, role: user.role })

    return HttpResponse.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    })
  }),
]
