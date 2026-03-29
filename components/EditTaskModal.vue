<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <Transition name="modal" appear>
        <div class="modal-container glass-card" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
          <!-- Header -->
          <div class="modal-header">
            <div class="modal-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <h2 id="edit-modal-title" class="modal-title">Редактировать задачу</h2>
            <button class="btn-ghost btn-icon modal-close" @click="$emit('close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="divider" />

          <!-- Form -->
          <form id="edit-task-form" @submit.prevent="onSubmit" novalidate>
            <!-- Title -->
            <div class="form-group">
              <label for="edit-title">Заголовок *</label>
              <input
                id="edit-title"
                v-model="form.Title"
                type="text"
                placeholder="Заголовок задачи"
                :class="{ 'input-error': errors.Title }"
                @blur="validateTitle"
              />
              <span v-if="errors.Title" class="form-error">{{ errors.Title }}</span>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label for="edit-desc">Описание</label>
              <textarea
                id="edit-desc"
                v-model="form.Description"
                placeholder="Описание задачи..."
                rows="3"
              />
            </div>

            <!-- Deadline -->
            <div class="form-group">
              <label for="edit-due">Дедлайн *</label>
              <input
                id="edit-due"
                v-model="form.DueDate"
                type="date"
                :class="{ 'input-error': errors.DueDate }"
                @blur="validateDate"
              />
              <span v-if="errors.DueDate" class="form-error">{{ errors.DueDate }}</span>
            </div>

            <!-- Status -->
            <div class="form-group">
              <label for="edit-status">Статус</label>
              <select id="edit-status" v-model="form.IsCompleted">
                <option :value="false">🔵 Активно</option>
                <option :value="true">✅ Выполнено</option>
              </select>
            </div>

            <!-- API Error -->
            <Transition name="slide-up">
              <div v-if="apiError" class="alert-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {{ apiError }}
              </div>
            </Transition>

            <!-- Actions -->
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="$emit('close')">Отмена</button>
              <button id="edit-task-submit" type="submit" class="btn-primary" :disabled="loading">
                <div v-if="loading" class="spinner" />
                <span>{{ loading ? 'Сохранение...' : 'Сохранить' }}</span>
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useTasksStore } from '~/stores/tasks.store'
import type { Task } from '~/stores/tasks.store'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ close: []; updated: [] }>()

const store = useTasksStore()

const form = reactive({
  Title: '',
  Description: '',
  DueDate: '',
  IsCompleted: false,
})

const errors = reactive({ Title: '', DueDate: '' })
const loading = ref(false)
const apiError = ref('')

// Populate form when task prop changes
watch(() => props.task, (val) => {
  if (val) {
    form.Title = val.Title
    form.Description = val.Description
    form.DueDate = val.DueDate
    form.IsCompleted = val.IsCompleted
  }
}, { immediate: true })

function validateTitle() {
  errors.Title = form.Title.trim() ? '' : 'Заголовок обязателен'
}

function validateDate() {
  errors.DueDate = form.DueDate ? '' : 'Укажите дедлайн'
}

async function onSubmit() {
  validateTitle()
  validateDate()
  if (errors.Title || errors.DueDate) return

  loading.value = true
  apiError.value = ''

  try {
    await store.updateTask(props.task.Id, { ...form })
    emit('updated')
    emit('close')
  } catch (e: any) {
    apiError.value = e.message || 'Ошибка сохранения'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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

.modal-container {
  width: 100%;
  max-width: 500px;
  padding: 1.75rem;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 1rem;
}

.modal-icon {
  width: 38px;
  height: 38px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  flex: 1;
}

.modal-close {
  color: var(--text-muted);
}
.modal-close:hover {
  color: var(--text-primary);
  background: var(--bg-card);
}

.input-error {
  border-color: var(--danger) !important;
  box-shadow: 0 0 0 3px var(--danger-soft) !important;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--danger-soft);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: var(--danger);
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
</style>
