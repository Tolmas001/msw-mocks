export interface Task {
  Id: number
  Title: string
  Description: string
  DueDate: string
  IsCompleted: boolean
  OwnerId: number
}

export let tasks: Task[] = [
  {
    Id: 1,
    Title: 'Настроить MSW-мок сервер',
    Description: 'Подключить MSW v2 к Nuxt 3, настроить обработчики для auth и tasks',
    DueDate: '2026-04-01',
    IsCompleted: true,
    OwnerId: 1,
  },
  {
    Id: 2,
    Title: 'Реализовать форму входа',
    Description: 'Форма email/password с валидацией, хранение токена в localStorage',
    DueDate: '2026-04-03',
    IsCompleted: true,
    OwnerId: 1,
  },
  {
    Id: 3,
    Title: 'Страница списка задач',
    Description: 'Отображение, сортировка по дате/статусу, фильтрация, пагинация',
    DueDate: '2026-04-05',
    IsCompleted: false,
    OwnerId: 1,
  },
  {
    Id: 4,
    Title: 'Добавить поиск с debounce',
    Description: 'Поле поиска с задержкой 300мс, обработка пустых результатов',
    DueDate: '2026-04-07',
    IsCompleted: false,
    OwnerId: 2,
  },
  {
    Id: 5,
    Title: 'Разграничение ролей',
    Description: 'Только создатель задачи или админ может редактировать/удалять',
    DueDate: '2026-04-10',
    IsCompleted: false,
    OwnerId: 2,
  },
  {
    Id: 6,
    Title: 'Написать документацию',
    Description: 'README с инструкциями по запуску и архитектурой проекта',
    DueDate: '2026-04-15',
    IsCompleted: false,
    OwnerId: 1,
  },
  {
    Id: 7,
    Title: 'Провести code review',
    Description: 'Проверить все компоненты и исправить замечания',
    DueDate: '2026-03-28',
    IsCompleted: false,
    OwnerId: 2,
  },
  {
    Id: 8,
    Title: 'Деплой на продакшн',
    Description: 'Настроить CI/CD пайплайн и выложить приложение',
    DueDate: '2026-04-20',
    IsCompleted: false,
    OwnerId: 1,
  },
]
