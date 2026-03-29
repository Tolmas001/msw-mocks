<template>
  <div class="skeleton-card">
    <div class="sk-header">
      <div class="skeleton sk-checkbox" />
      <div class="sk-title-area">
        <div class="skeleton sk-title" />
        <div class="skeleton sk-badge" />
      </div>
    </div>
    <div class="skeleton sk-desc" />
    <div class="skeleton sk-desc sk-desc-short" />
    <div class="sk-footer">
      <div class="skeleton sk-date" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.sk-header {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  margin-bottom: 0.75rem;
}

.sk-title-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sk-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  flex-shrink: 0;
  margin-top: 2px;
}

.sk-title {
  height: 18px;
  width: 70%;
  border-radius: 4px;
}

.sk-badge {
  height: 20px;
  width: 80px;
  border-radius: 999px;
}

.sk-desc {
  height: 14px;
  width: 90%;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}
.sk-desc-short {
  width: 60%;
}

.sk-footer {
  display: flex;
  border-top: 1px solid var(--border);
  padding-top: 0.75rem;
  margin-top: 0.25rem;
}

.sk-date {
  height: 14px;
  width: 100px;
  border-radius: 4px;
}
</style>
