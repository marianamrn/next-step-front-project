// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/components/login-components/login.vue'
import RegisterPage from '@/components/login-components/registration.vue'
import AdminPanel from '@/components/admin/AdminPanel.vue'
import StudentManagement from '@/components/admin/StudentManagement.vue'
import CoursesManagement from '@/components/admin/courses-management'
import AdministratorsManage from '@/components/admin/admins-manage/AdministratorsManage.vue'
import TeachersManage from '@/components/admin/teachers-manage/TeachersManage.vue'

// Публічні сторінки для користувачів
import HomePage from '@/components/pages/HomePage.vue'
import AboutUs from '@/components/pages/AboutUs.vue'
import CoursesPage from '@/components/pages/CoursesPage.vue'
import MyCoursesPage from '@/components/pages/MyCoursesPage.vue'
import CourseDetails from '@/components/courses/CourseDetails.vue'
import CoursesList from '@/components/courses/CoursesList.vue'

// Компонент для перегляду уроку
import LessonView from '@/components/lessons/LessonView.vue'
// Компонент для редагування уроку
import LessonEdit from '@/components/lessons/LessonEdit.vue'
// Компонент для додавання уроку
import AddLesson from '@/components/lessons/AddLesson.vue'

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

// Перевірка ролі для доступу до адмін-маршрутів
const checkRoleAccess = (roles) => (to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role?.name;
  if (!role || !roles.includes(role)) {
    next('/home');
  } else {
    next();
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
    component: CoursesList,
  },
  {
    path: '/courses/category/:categoryId',
    name: 'CoursesByCategory',
    component: CoursesList,
    props: true,
  },
  {
    path: '/courses/level/:levelId',
    name: 'CoursesByLevel',
    component: CoursesList,
    props: true,
  },
  {
    path: '/courses/instructor/:instructorId',
    name: 'CoursesByInstructor',
    component: CoursesList,
    props: true,
  },
  {
    path: '/courses/search',
    name: 'CoursesSearch',
    component: CoursesList,
    props: (route) => ({ query: route.query.q }),
  },
  {
    path: '/courses/:id',
    name: 'CourseDetails',
    component: CourseDetails,
    props: true,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutUs,
  },
  {
    path: '/my-courses',
    name: 'MyCoursesNew',
    component: () => import('@/components/my-courses/MyCourses.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/my-courses/:id',
    name: 'MyCourseDetail',
    component: () => import('@/components/my-courses/MyCourseDetail.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/payment/:courseId',
    name: 'LiqPayPayment',
    component: () => import('@/components/my-courses/LiqPayPayment.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/payment-status/:paymentId/:courseId',
    name: 'PaymentStatus',
    component: () => import('@/components/my-courses/PaymentStatus.vue'),
    props: true,
    meta: { requiresAuth: true },
  },

  // Адміністративна панель
  {
    path: '/admin',
    component: AdminPanel,
    meta: { requiresAuth: true, roles: ['super_admin', 'admin', 'teacher'] },
    beforeEnter: [checkAuth, checkRoleAccess(['super_admin', 'admin', 'teacher'])],
    children: [
      { path: '', redirect: '/admin/students' },
      {
        path: 'students',
        name: 'AdminStudents',
        component: StudentManagement,
        meta: { roles: ['super_admin', 'admin', 'teacher'] },
        beforeEnter: checkRoleAccess(['super_admin', 'admin', 'teacher'])
      },
      {
        path: 'students/:id',
        name: 'AdminStudentDetail',
        component: StudentManagement,
        props: true,
        meta: { roles: ['super_admin', 'admin', 'teacher'] },
        beforeEnter: checkRoleAccess(['super_admin', 'admin', 'teacher'])
      },
      {
        path: 'courses',
        name: 'AdminCourses',
        component: CoursesManagement,
        meta: { roles: ['super_admin', 'admin', 'teacher'] },
        beforeEnter: checkRoleAccess(['super_admin', 'admin', 'teacher'])
      },
      {
        path: 'courses/:id',
        name: 'AdminCourseDetail',
        component: CoursesManagement,
        props: (route) => ({ id: route.params.id }),
        meta: { roles: ['super_admin', 'admin', 'teacher'] },
        beforeEnter: checkRoleAccess(['super_admin', 'admin', 'teacher'])
      },
      {
        path: 'courses/:courseId/lesson/:lessonId',
        name: 'AdminLessonView',
        component: LessonView,
        props: true,
        meta: { roles: ['super_admin', 'admin', 'teacher'] },
        beforeEnter: checkRoleAccess(['super_admin', 'admin', 'teacher'])
      },
      {
        path: 'courses/:courseId/lesson/:lessonId/edit',
        name: 'AdminLessonEdit',
        component: LessonEdit,
        props: true,
        meta: { roles: ['super_admin', 'admin', 'teacher'] },
        beforeEnter: checkRoleAccess(['super_admin', 'admin', 'teacher'])
      },
      {
        path: 'courses/:courseId/module/:moduleId/add-lesson',
        name: 'AdminAddLesson',
        component: AddLesson,
        props: true,
        meta: { roles: ['super_admin', 'admin', 'teacher'] },
        beforeEnter: checkRoleAccess(['super_admin', 'admin', 'teacher'])
      },
      {
        path: 'teachers',
        name: 'AdminTeachers',
        component: TeachersManage,
        meta: { roles: ['super_admin', 'admin'] },
        beforeEnter: checkRoleAccess(['super_admin', 'admin'])
      },
      {
        path: 'teachers/:id',
        name: 'AdminTeacherDetail',
        component: () => import('@/components/admin/teachers-manage/TeacherDetailPage.vue'),
        props: true,
        meta: { roles: ['super_admin', 'admin'] },
        beforeEnter: checkRoleAccess(['super_admin', 'admin'])
      },
      {
        path: 'administrators',
        name: 'AdminAdministrators',
        component: AdministratorsManage,
        props: { feature: 'Адміністратори' },
        meta: { roles: ['super_admin'] },
        beforeEnter: checkRoleAccess(['super_admin'])
      },
      {
        path: 'administrators/:id',
        name: 'AdminAdministratorDetail',
        component: () => import('@/components/admin/admins-manage/AdminDetailPage.vue'),
        props: true,
        meta: { roles: ['super_admin'] },
        beforeEnter: checkRoleAccess(['super_admin'])
      },
      {
        path: 'comments',
        name: 'AdminComments',
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Коментарі та відгуки' },
        meta: { roles: ['super_admin', 'admin', 'teacher'] },
        beforeEnter: checkRoleAccess(['super_admin', 'admin', 'teacher'])
      },
      {
        path: 'statistics',
        name: 'AdminStatistics',
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Статистика' },
        meta: { roles: ['super_admin', 'admin', 'teacher'] },
        beforeEnter: checkRoleAccess(['super_admin', 'admin', 'teacher'])
      },
      {
        path: 'financial',
        name: 'AdminFinancial',
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Фінансовий модуль' },
        meta: { roles: ['super_admin', 'admin'] },
        beforeEnter: checkRoleAccess(['super_admin', 'admin'])
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/components/admin/ComingSoon.vue'),
        props: { feature: 'Налаштування системи' },
        meta: { roles: ['super_admin'] },
        beforeEnter: checkRoleAccess(['super_admin'])
      },
      {
        path: 'requests',
        name: 'AdminRequests',
        component: () => import('@/components/admin/requests-manage/RequestsManage.vue'),
        meta: { roles: ['super_admin', 'admin', 'teacher'] },
        beforeEnter: checkRoleAccess(['super_admin', 'admin', 'teacher'])
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
