export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return

  const token = process.client ? localStorage.getItem('token') : null

  // Not logged in — redirect to login (except when already going there)
  if (!token && to.path !== '/login') {
    return navigateTo('/login')
  }

  // Already logged in — don't show login page again
  if (token && to.path === '/login') {
    return navigateTo('/tasks')
  }
})
