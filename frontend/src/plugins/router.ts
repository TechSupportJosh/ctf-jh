import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import Help from "../routes/Help.vue";
import RecentFeed from "../routes/RecentFeed.vue";
import Challenges from "../routes/Challenges.vue";
import Admin from "../routes/Admin.vue";
import Login from "../routes/Login.vue";
import config from "../config";
import SidebarView from "../components/SidebarView.vue";
import store from "./store";
import Team from "../routes/Team.vue";
import TeamSettings from "../routes/TeamSettings.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/",
    component: SidebarView,
    children: [
      {
        path: "/feed",
        component: RecentFeed,
      },
      {
        path: "/help",
        component: Help,
      },
      {
        path: "/challenges/:category",
        component: Challenges,
      },
      {
        path: "/team",
        component: Team,
      },
      {
        path: "/team/settings",
        component: TeamSettings,
      },
    ],
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
  history: createWebHistory(config.basePath),
  routes: routes,
});

export const useRouter = () => {
  return router;
};

router.beforeEach(async (to, from) => {
  if (!store.state.user && to.path !== "/login") return "/login?error=requires-auth";
  if (store.state.user && to.path === "/login") return "/help";

  if (to.meta.requiresAdmin && !store.state.user?.isAdmin) return "/help";

  if (to.path === "/") return "/help";

  return true;
});

export default router;
