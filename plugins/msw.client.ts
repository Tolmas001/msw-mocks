export default defineNuxtPlugin(async () => {
  if (process.server) return
  if (import.meta.env.MODE !== 'development' && import.meta.env.PROD) return

  const { worker } = await import('~/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
})