import { users } from '../data/users.data'

export interface TokenPayload {
  id: number
  email: string
  role: 'admin' | 'user'
}

// Encode user info into a base64 "token"
export function encodeToken(user: TokenPayload): string {
  return btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }))
}

// Decode token and return user info
export function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = JSON.parse(atob(token)) as TokenPayload
    // Verify user still exists in our DB
    const user = users.find(u => u.id === payload.id)
    if (!user) return null
    return payload
  } catch {
    return null
  }
}

// Parse Authorization header and return user
export function getUserFromAuthHeader(auth?: string | null): TokenPayload | null {
  if (!auth) return null
  const token = auth.replace('Bearer ', '').trim()
  return decodeToken(token)
}
