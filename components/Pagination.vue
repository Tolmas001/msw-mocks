<template>
  <div v-if="totalPages > 1" class="pagination">
    <!-- Prev -->
    <button
      id="pagination-prev"
      class="page-btn btn-ghost"
      :disabled="currentPage <= 1"
      @click="$emit('change', currentPage - 1)"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>

    <!-- Page numbers -->
    <template v-for="p in visiblePages" :key="p">
      <span v-if="p === '...'" class="page-ellipsis">…</span>
      <button
        v-else
        :id="`pagination-page-${p}`"
        class="page-btn"
        :class="{ active: p === currentPage }"
        @click="$emit('change', p as number)"
      >
        {{ p }}
      </button>
    </template>

    <!-- Next -->
    <button
      id="pagination-next"
      class="page-btn btn-ghost"
      :disabled="currentPage >= totalPages"
      @click="$emit('change', currentPage + 1)"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  </div>
  <p v-if="total > 0" class="page-info">
    Показано {{ from }}–{{ to }} из {{ total }}
  </p>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
  total: number
  limit: number
}>()

defineEmits<{ change: [page: number] }>()

const from = computed(() => (props.currentPage - 1) * props.limit + 1)
const to = computed(() => Math.min(props.currentPage * props.limit, props.total))

const visiblePages = computed(() => {
  const p = props.currentPage
  const t = props.totalPages
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)

  const pages: (number | string)[] = [1]

  if (p > 3) pages.push('...')
  for (let i = Math.max(2, p - 1); i <= Math.min(t - 1, p + 1); i++) {
    pages.push(i)
  }
  if (p < t - 2) pages.push('...')

  pages.push(t)
  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 1.5rem;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  transition: all var(--transition-fast);
}
.page-btn:hover:not(:disabled):not(.active) {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border-color: var(--border-focus);
}
.page-btn.active {
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 2px 8px var(--accent-glow);
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-ellipsis {
  color: var(--text-muted);
  width: 28px;
  text-align: center;
  font-size: 1rem;
  user-select: none;
}

.page-info {
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}
</style>
