<template>
  <div class="task-card" :class="{ 'is-completed': task.IsCompleted, 'is-overdue': isOverdue && !task.IsCompleted }">
    <!-- Card header: checkbox + title + badge -->
    <div class="card-header">
      <label class="checkbox-wrapper" :for="`task-check-${task.Id}`">
        <input
          :id="`task-check-${task.Id}`"
          type="checkbox"
          class="visually-hidden"
          :checked="task.IsCompleted"
          :disabled="toggling"
          @change="onToggle"
        />
        <span class="custom-checkbox" :class="{ checked: task.IsCompleted, toggling }">
          <svg v-if="task.IsCompleted" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>
      </label>

      <div class="card-title-area">
        <h3 class="task-title">{{ task.Title }}</h3>
        <div class="card-badges">
          <span v-if="task.IsCompleted" class="badge badge-completed">✓ Выполнено</span>
          <span v-else-if="isOverdue" class="badge badge-overdue">⚠ Просрочено</span>
          <span v-else class="badge badge-active">● Активно</span>
        </div>
      </div>

      <!-- Action buttons (only if user can edit) -->
      <div v-if="canEdit" class="card-actions">
        <button
          :id="`task-edit-${task.Id}`"
          class="btn-ghost btn-icon action-btn"
          title="Редактировать"
          @click="$emit('edit', task)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button
          :id="`task-delete-${task.Id}`"
          class="btn-ghost btn-icon action-btn action-btn-delete"
          title="Удалить"
          @click="$emit('delete', task.Id)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Description -->
    <p v-if="task.Description" class="task-desc">{{ task.Description }}</p>

    <!-- Footer: due date + owner indicator -->
    <div class="card-footer">
      <div class="due-date" :class="{ overdue: isOverdue && !task.IsCompleted }">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {{ formatDate(task.DueDate) }}
      </div>
      <div v-if="ownedByMe" class="owner-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Моя задача
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/stores/tasks.store'

const props = defineProps<{
  task: Task
  canEdit: boolean
  ownedByMe: boolean
}>()

const emit = defineEmits<{
  edit: [task: Task]
  delete: [id: number]
  toggle: [task: Task]
}>()

const toggling = ref(false)

const isOverdue = computed(() => {
  const due = new Date(props.task.DueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
})

function formatDate(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function onToggle() {
  if (toggling.value) return
  toggling.value = true
  try {
    await emit('toggle', props.task)
  } finally {
    setTimeout(() => { toggling.value = false }, 500)
  }
}
</script>

<style scoped>
.task-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.task-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, var(--accent), #8b5cf6);
  border-radius: 3px 0 0 3px;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.task-card:hover {
  background: var(--bg-card-hover);
  border-color: rgba(108, 99, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.task-card:hover::before {
  opacity: 1;
}

.task-card.is-completed {
  opacity: 0.65;
}
.task-card.is-completed::before {
  background: var(--success);
  opacity: 0.6;
}

.task-card.is-overdue {
  border-color: rgba(239, 68, 68, 0.2);
}
.task-card.is-overdue::before {
  background: var(--danger);
  opacity: 1;
}

/* Card header */
.card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
}

.card-title-area {
  flex: 1;
  min-width: 0;
}

/* Custom checkbox */
.checkbox-wrapper {
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.custom-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid var(--border-input);
  background: var(--bg-input);
  transition: all var(--transition-fast);
  color: #fff;
}
.custom-checkbox.checked {
  background: var(--success);
  border-color: var(--success);
}
.custom-checkbox.toggling {
  opacity: 0.5;
  animation: spin 0.5s linear;
}
.checkbox-wrapper:hover .custom-checkbox:not(.checked) {
  border-color: var(--accent);
  background: var(--accent-soft);
}

/* Title */
.task-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.375rem;
  line-height: 1.4;
  word-break: break-word;
}
.is-completed .task-title {
  text-decoration: line-through;
  color: var(--text-muted);
}

/* Badges row */
.card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

/* Action buttons */
.card-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity var(--transition-fast);
}
.task-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  color: var(--text-muted);
  width: 30px;
  height: 30px;
}
.action-btn:hover {
  color: var(--text-primary);
  background: var(--bg-card-hover);
}
.action-btn-delete:hover {
  color: var(--danger);
  background: var(--danger-soft);
}

/* Description */
.task-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.75rem;
  line-height: 1.5;
  padding-left: 2rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.875rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.due-date {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-muted);
}
.due-date.overdue {
  color: var(--danger);
}

.owner-badge {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: var(--accent-light);
  background: var(--accent-soft);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
}
</style>
