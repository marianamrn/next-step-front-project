// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from "@/components/login-components/login.vue"
import RegisterPage from "@/components/login-components/registration.vue"
import AdminPanel from "@/components/admin/AdminPanel.vue"

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
  { path: '/', redirect: '/login' }, 
  { path: '/login', name: "Login", component: LoginPage },
  { path: '/register', name: "Register", component: RegisterPage },
  
  // Адміністративна панель
  { 
    path: '/admin',
    component: AdminPanel,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/courses' }, // Змінено на курси за замовчуванням
      { path: 'students', name: 'AdminStudents', component: AdminPanel, props: { activeRoute: 'students' } },
      { path: 'teachers', name: 'AdminTeachers', component: AdminPanel, props: { activeRoute: 'teachers' } },
      { path: 'administrators', name: 'AdminAdministrators', component: AdminPanel, props: { activeRoute: 'administrators' } },
      { path: 'courses', name: 'AdminCourses', component: AdminPanel, props: { activeRoute: 'courses' } },
      { path: 'comments', name: 'AdminComments', component: AdminPanel, props: { activeRoute: 'comments' } },
      { path: 'statistics', name: 'AdminStatistics', component: AdminPanel, props: { activeRoute: 'statistics' } },
      { path: 'financial', name: 'AdminFinancial', component: AdminPanel, props: { activeRoute: 'financial' } },
      { path: 'settings', name: 'AdminSettings', component: AdminPanel, props: { activeRoute: 'settings' } },
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