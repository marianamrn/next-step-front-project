// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from "@/components/login-components/login.vue"
import RegisterPage from "@/components/login-components/registration.vue"
import AdminPanel from "@/components/admin/AdminPanel.vue"
import StudentManagement from "@/components/admin/StudentManagement.vue"
import CourseManagement from "@/components/admin/CourseManagement.vue"

// Функція для перевірки авторизації
const checkAuth = (to, from, next) => {
  const token = localStorage.getItem('token');
  if (!token && to.meta.requiresAuth) {
    next('/login');
  } else {
    next();
  }
}

const routes = [
  { path: '/', redirect: '/admin/students' }, // Перенаправляємо на управління студентами
  { path: '/login', name: "Login", component: LoginPage },
  { path: '/register', name: "Register", component: RegisterPage },
  
  // Адміністративна панель з вкладеними маршрутами
  { 
    path: '/admin',
    component: AdminPanel,
    meta: { requiresAuth: false }, // Тимчасово вимкнено перевірку авторизації
    children: [
      { path: '', redirect: '/admin/students' }, // За замовчуванням показуємо управління студентами
      { 
        path: 'students', 
        name: 'AdminStudents', 
        component: StudentManagement 
      },
      { 
        path: 'courses', 
        name: 'AdminCourses', 
        component: CourseManagement 
      },
      // Інші розділи, які будуть реалізовані пізніше
      { 
        path: 'teachers', 
        name: 'AdminTeachers', 
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Викладачі' }
      },
      { 
        path: 'administrators', 
        name: 'AdminAdministrators', 
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Адміністратори' }
      },
      { 
        path: 'comments', 
        name: 'AdminComments', 
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Коментарі та відгуки' }
      },
      { 
        path: 'statistics', 
        name: 'AdminStatistics', 
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Статистика' }
      },
      { 
        path: 'financial', 
        name: 'AdminFinancial', 
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Фінансовий модуль' }
      },
      { 
        path: 'settings', 
        name: 'AdminSettings', 
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Налаштування системи' }
      },
    ]
  },
  
  // Маршрут для неіснуючих сторінок
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Коментуємо перевірку авторизації, поки не підключений бекенд
// router.beforeEach(checkAuth);

export default router;