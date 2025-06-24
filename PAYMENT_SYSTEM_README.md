# Система Платежів NextStep - Документація

## 📋 Огляд

Система платежів NextStep забезпечує повний цикл обробки платежів за курси, включаючи ініціалізацію платежів, інтеграцію з LiqPay, адміністративне управління та надання доступу до курсів.

## 🔗 API Endpoints

### Платежі

#### 1. Ініціалізація платежу
```
POST /api/payments/course/{courseId}
```
**Опис:** Створює новий платіж для курсу
**Відповідь:**
```json
{
  "payment": {
    "id": 1,
    "amount": 1500,
    "payment_status": "pending",
    "course": { "id": 1, "title": "Назва курсу" },
    "user": { "id": 1, "name": "Ім'я користувача" }
  },
  "liqpay_data": {
    "url": "https://www.liqpay.ua/api/3/checkout",
    "params": {
      "data": "encoded_data",
      "signature": "signature_hash"
    }
  }
}
```

#### 2. Перевірка статусу платежу
```
GET /api/payments/{paymentId}/status
```
**Опис:** Перевіряє поточний статус платежу
**Відповідь:**
```json
{
  "payment": {
    "id": 1,
    "payment_status": "completed",
    "amount": 1500,
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

#### 3. Успішна оплата
```
GET /api/payments/course/{courseId}/success
```
**Опис:** Обробляє успішну оплату після редіректу з LiqPay
**Відповідь:**
```json
{
  "success": true,
  "message": "Платіж успішно оброблений",
  "enrollment": {
    "id": 1,
    "course_id": 1,
    "user_id": 1,
    "status": "active"
  }
}
```

#### 4. Невдалий платіж
```
GET /api/payments/{paymentId}/failed
```
**Опис:** Обробляє невдалий платіж
**Відповідь:**
```json
{
  "success": false,
  "message": "Платіж не пройшов",
  "payment": {
    "id": 1,
    "payment_status": "failed"
  }
}
```

#### 5. Всі платежі користувача
```
GET /api/payments
```
**Опис:** Отримує всі платежі поточного користувача
**Відповідь:**
```json
{
  "payments": [
    {
      "id": 1,
      "amount": 1500,
      "payment_status": "completed",
      "course": { "title": "Назва курсу" },
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### Підписки та доступ

#### 6. Перевірка доступу до курсу
```
GET /api/enrollments/course/{courseId}
```
**Опис:** Перевіряє чи має користувач доступ до курсу
**Відповідь:**
```json
{
  "has_access": true,
  "enrollment": {
    "id": 1,
    "course_id": 1,
    "user_id": 1,
    "status": "active",
    "progress": 25
  }
}
```

#### 7. Всі куплені курси
```
GET /api/enrollments
```
**Опис:** Отримує всі курси, на які записаний користувач
**Відповідь:**
```json
{
  "enrollments": [
    {
      "id": 1,
      "course": {
        "id": 1,
        "title": "Назва курсу",
        "cover_url": "url_to_image"
      },
      "status": "active",
      "progress": 25
    }
  ]
}
```

#### 8. Доступ до безкоштовного курсу
```
GET /api/enrollments/free/{courseId}
```
**Опис:** Записує користувача на безкоштовний курс
**Відповідь:**
```json
{
  "success": true,
  "message": "Ви успішно записалися на безкоштовний курс",
  "enrollment": {
    "id": 1,
    "course_id": 1,
    "user_id": 1,
    "status": "active"
  }
}
```

### Адміністративні функції

#### 9. Підтвердження платежу (Адмін)
```
POST /api/payments/{paymentId}/confirm
```
**Опис:** Підтверджує платіж та надає доступ до курсу
**Відповідь:**
```json
{
  "success": true,
  "message": "Платіж підтверджено успішно",
  "payment": {
    "id": 1,
    "payment_status": "completed"
  }
}
```

## 🎯 Frontend Компоненти

### 1. LiqPayPayment.vue
**Шлях:** `src/components/my-courses/LiqPayPayment.vue`
**Функціональність:**
- Ініціалізація платежу через API
- Відображення LiqPay форми
- Обробка відповіді від API
- Перенаправлення на статус платежу

**Використання:**
```vue
<LiqPayPayment :courseId="courseId" />
```

### 2. PaymentStatus.vue
**Шлях:** `src/components/my-courses/PaymentStatus.vue`
**Функціональність:**
- Перевірка статусу платежу
- Автоматичне оновлення статусу
- Відображення різних станів платежу
- Перенаправлення на курс після успішної оплати

**Використання:**
```vue
<PaymentStatus :paymentId="paymentId" :courseId="courseId" />
```

### 3. MyCourses.vue
**Шлях:** `src/components/my-courses/MyCourses.vue`
**Функціональність:**
- Відображення всіх куплених курсів
- Перехід до деталей курсу
- Інтеграція з API enrollments

### 4. MyCourseDetail.vue
**Шлях:** `src/components/my-courses/MyCourseDetail.vue`
**Функціональність:**
- Перевірка доступу до курсу
- Відображення прогресу проходження
- Список уроків курсу

### 5. CourseCard.vue
**Шлях:** `src/components/courses/CourseCard.vue`
**Функціональність:**
- Кнопка "Купити курс" для платних курсів
- Кнопка "Записатися безкоштовно" для безкоштовних курсів
- Інтеграція з API платежів та підписок

### 6. PaymentsManagement.vue (Адмін)
**Шлях:** `src/components/admin/PaymentsManagement.vue`
**Функціональність:**
- Перегляд всіх платежів
- Фільтрація за статусом, датою, користувачем
- Підтвердження/відхилення платежів
- Статистика платежів

## 🔧 API Сервіси

### Основні функції (`src/services/api.js`)

```javascript
// Ініціалізація платежу
export async function initiateCoursePayment(courseId)

// Перевірка статусу
export async function checkPaymentStatus(paymentId)

// Успішна оплата
export async function handlePaymentSuccess(courseId)

// Невдалий платіж
export async function handleFailedPayment(paymentId)

// Всі платежі користувача
export async function getUserPayments()

// Перевірка доступу
export async function checkCourseAccess(courseId)

// Всі підписки
export async function getUserEnrollments()

// Безкоштовний курс
export async function enrollFreeCourse(courseId)

// Адмін функції
export async function getAdminPayments(filters, page, perPage)
export async function confirmPayment(paymentId)
export async function rejectPayment(paymentId, reason)
export async function getPaymentDetails(paymentId)
export async function getPaymentStatistics()
```

## 🧪 Тестування

### Тестовий файл
**Файл:** `test-payment-flow.html`
**Функціональність:**
- Тестування всіх API endpoint'ів
- Інтерактивний інтерфейс для перевірки
- Автоматичне тестування повного циклу
- Відображення відповідей API

**Використання:**
1. Відкрийте файл у браузері
2. Введіть необхідні дані (ID курсів, платежів)
3. Натисніть кнопки для тестування різних функцій
4. Перегляньте відповіді API

## 🔄 Життєвий цикл платежу

### 1. Ініціалізація
```
Користувач → Натискає "Купити курс" → API: POST /payments/course/{id}
```

### 2. LiqPay оплата
```
API повертає LiqPay форму → Користувач оплачує → LiqPay редірект
```

### 3. Обробка успішної оплати
```
LiqPay → API: GET /payments/course/{id}/success → Створення підписки
```

### 4. Адмін підтвердження
```
Адмін → Переглядає платежі → Підтверджує → API: POST /payments/{id}/confirm
```

### 5. Доступ до курсу
```
Користувач → Перевіряє доступ → API: GET /enrollments/course/{id} → Доступ надано
```

## 🚨 Обробка помилок

### Типові помилки та рішення

1. **401 Unauthorized**
   - Перевірте токен авторизації
   - Переконайтеся, що користувач залогінений

2. **404 Not Found**
   - Перевірте правильність ID курсу/платежу
   - Переконайтеся, що ресурс існує

3. **422 Validation Error**
   - Перевірте валідність даних
   - Перегляньте повідомлення про помилки

4. **500 Server Error**
   - Зверніться до адміністратора
   - Перевірте логи сервера

## 📱 Інтеграція з Vue Router

### Маршрути

```javascript
// Платежі
{
  path: '/payment/:courseId',
  component: LiqPayPayment
},
{
  path: '/payment-status/:paymentId/:courseId',
  component: PaymentStatus
},

// Мої курси
{
  path: '/my-courses',
  component: MyCourses
},
{
  path: '/my-courses/:id',
  component: MyCourseDetail
},

// Адмін панель
{
  path: '/admin/payments',
  component: PaymentsManagement
}
```

## 🔐 Безпека

### Авторизація
- Всі API запити потребують Bearer токен
- Токен зберігається в localStorage
- Автоматичне перенаправлення на логін при 401 помилці

### Валідація
- Перевірка вхідних даних на фронтенді
- Валідація на бекенді
- Обробка помилок валідації

## 📊 Статистика

### Адміністративна статистика
- Загальна кількість платежів
- Платежі в очікуванні
- Завершені платежі
- Загальний дохід

### Користувацька статистика
- Прогрес проходження курсів
- Кількість куплених курсів
- Статус підписок

## 🔄 Оновлення та підтримка

### Версіонування API
- Всі endpoint'и використовують версію `/api/`
- Зворотна сумісність зберігається
- Нові функції додаються без порушення існуючих

### Логування
- Всі API запити логуються
- Помилки зберігаються для діагностики
- Моніторинг продуктивності

## 📞 Підтримка

При виникненні проблем:
1. Перевірте консоль браузера на помилки
2. Використайте тестовий файл для діагностики
3. Перегляньте логи сервера
4. Зверніться до команди розробки

---

**Останнє оновлення:** Січень 2024  
**Версія API:** v1  
**Статус:** Активна розробка 