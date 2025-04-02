import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from "@/components/login-components/login.vue"
import RegisterPage from "@/components/login-components/registration.vue";

const routes = [
    {path:'/Login',name:"Login", component : LoginPage},
    {path:'/Register',name:"Register", component : RegisterPage},
  ];

  const router = createRouter({
    history: createWebHistory(),
    routes,
  });
export default router
