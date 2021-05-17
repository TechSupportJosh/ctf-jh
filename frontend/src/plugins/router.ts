import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import Home from "../routes/Home.vue";
import Admin from "../routes/Admin.vue";
import Login from "../routes/Login.vue";
import API from "../utils/api";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/",
    component: Home,
  },
  {
    path: "/admin",
    component: Admin,
    meta: {
      requiresAdmin: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export const useRouter = () => {
  return router;
};

router.beforeEach(async (to, from) => {
  const user = await API.getUser();

  if (!user && to.path !== "/login") return "/login";
  if (user && to.path === "/login") return "/";

  if (to.meta.requiresAdmin && !user?.is_admin) return "/";

  return true;
});

export default router;
