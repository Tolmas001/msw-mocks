export default defineNuxtPlugin(async () => {
  if (process.server) return

  const { worker } = await import('~/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
})