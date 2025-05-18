// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/components/login-components/login.vue'
import RegisterPage from '@/components/login-components/registration.vue'
import AdminPanel from '@/components/admin/AdminPanel.vue'
import StudentManagement from '@/components/admin/StudentManagement.vue'
import CoursesManagement from '@/components/admin/courses-management'

// Публічні сторінки для користувачів
import HomePage from '@/components/pages/HomePage.vue'
import AboutUs from '@/components/pages/AboutUs.vue'
import CoursesPage from '@/components/pages/CoursesPage.vue'
import MyCoursesPage from '@/components/pages/MyCoursesPage.vue'

// Перевірка авторизації
const checkAuth = (to, from, next) => {
  const token = localStorage.getItem('token')

  if (!token && to.meta.requiresAuth) {
    // Якщо немає токена і маршрут вимагає авторизації, перенаправляємо на сторінку логіну
    next('/login')
  } else {
    next()
  }
}

// Перевірка адміністратора
const checkAdmin = (to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const adminEmails = ['admin@example.com', 'super_admin@example.com', 'petropetrenko@gmail.com']

  const isAdmin =
    adminEmails.includes(user.email?.toLowerCase()) || user.email?.toLowerCase().includes('admin')

  if (!isAdmin) {
    next('/home')
  } else {
    next()
  }
}

const routes = [
  // Головний редирект на домашню сторінку
  { path: '/', redirect: '/home' },

  // Сторінки авторизації
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },

  // Публічні сторінки для користувачів
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/courses',
    name: 'Courses',
    component: CoursesPage,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutUs,
  },
  {
    path: '/my-courses',
    name: 'MyCourses',
    component: MyCoursesPage,
    meta: { requiresAuth: true },
  },

  // Адміністративна панель
  {
    path: '/admin',
    component: AdminPanel,
    meta: { requiresAuth: true },
    beforeEnter: [checkAuth, checkAdmin],
    children: [
      { path: '', redirect: '/admin/students' },
      {
        path: 'students',
        name: 'AdminStudents',
        component: StudentManagement,
      },
      {
        path: 'students/:id',
        name: 'AdminStudentDetail',
        component: StudentManagement,
        props: true,
      },
      {
        path: 'courses',
        name: 'AdminCourses',
        component: CoursesManagement,
      },
      {
        path: 'courses/:id',
        name: 'AdminCourseDetail',
        component: CoursesManagement,
        props: (route) => ({ id: route.params.id }),
      },
      // Інші розділи, які будуть реалізовані пізніше
      {
        path: 'teachers',
        name: 'AdminTeachers',
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Викладачі' },
      },
      {
        path: 'administrators',
        name: 'AdminAdministrators',
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Адміністратори' },
      },
      {
        path: 'comments',
        name: 'AdminComments',
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Коментарі та відгуки' },
      },
      {
        path: 'statistics',
        name: 'AdminStatistics',
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Статистика' },
      },
      {
        path: 'financial',
        name: 'AdminFinancial',
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Фінансовий модуль' },
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Налаштування системи' },
      },
    ],
  },

  // Маршрут для неіснуючих сторінок
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Додаємо перевірку авторизації для захищених маршрутів
router.beforeEach(checkAuth)

export default router
