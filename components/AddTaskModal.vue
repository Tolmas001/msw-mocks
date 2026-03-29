<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <Transition name="modal" appear>
        <div class="modal-container glass-card" role="dialog" aria-modal="true" aria-labelledby="add-modal-title">
          <!-- Header -->
          <div class="modal-header">
            <div class="modal-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <h2 id="add-modal-title" class="modal-title">Новая задача</h2>
            <button class="btn-ghost btn-icon modal-close" @click="$emit('close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="divider" />

          <!-- Form -->
          <form id="add-task-form" @submit.prevent="onSubmit" novalidate>
            <!-- Title -->
            <div class="form-group">
              <label for="add-title">Заголовок *</label>
              <input
                id="add-title"
                v-model="form.Title"
                type="text"
                placeholder="Что нужно сделать?"
                :class="{ 'input-error': errors.Title }"
                @blur="validateTitle"
              />
              <span v-if="errors.Title" class="form-error">{{ errors.Title }}</span>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label for="add-desc">Описание</label>
              <textarea
                id="add-desc"
                v-model="form.Description"
                placeholder="Подробное описание задачи..."
                rows="3"
              />
            </div>

            <!-- Deadline -->
            <div class="form-group">
              <label for="add-due">Дедлайн *</label>
              <input
                id="add-due"
                v-model="form.DueDate"
                type="date"
                :min="today"
                :class="{ 'input-error': errors.DueDate }"
                @blur="validateDate"
              />
              <span v-if="errors.DueDate" class="form-error">{{ errors.DueDate }}</span>
            </div>

            <!-- Status -->
            <div class="form-group">
              <label for="add-status">Статус</label>
              <select id="add-status" v-model="form.IsCompleted">
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
              <button id="add-task-submit" type="submit" class="btn-primary" :disabled="loading">
                <div v-if="loading" class="spinner" />
                <span>{{ loading ? 'Создание...' : 'Создать задачу' }}</span>
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useTasksStore } from '~/stores/tasks.store'

const emit = defineEmits<{ close: []; created: [] }>()
const store = useTasksStore()

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  Title: '',
  Description: '',
  DueDate: '',
  IsCompleted: false,
})

const errors = reactive({ Title: '', DueDate: '' })
const loading = ref(false)
const apiError = ref('')

function validateTitle() {
  errors.Title = form.Title.trim() ? '' : 'Заголовок обязателен'
}

function validateDate() {
  if (!form.DueDate) {
    errors.DueDate = 'Укажите дедлайн'
  } else {
    errors.DueDate = ''
  }
}

async function onSubmit() {
  validateTitle()
  validateDate()
  if (errors.Title || errors.DueDate) return

  loading.value = true
  apiError.value = ''

  try {
    await store.createTask({ ...form })
    emit('created')
    emit('close')
  } catch (e: any) {
    apiError.value = e.message || 'Ошибка создания задачи'
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
  background: var(--accent-soft);
  border: 1px solid rgba(108, 99, 255, 0.25);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-light);
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
