import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import SidebarView from "../components/SidebarView.vue";
import config from "../config";
import Admin from "../routes/Admin.vue";
import Challenges from "../routes/Challenges.vue";
import Help from "../routes/Help.vue";
import Leaderboard from "../routes/Leaderboard.vue";
import Login from "../routes/Login.vue";
import Profile from "../routes/Profile.vue";
import RecentFeed from "../routes/RecentFeed.vue";
import Team from "../routes/Team.vue";
import TeamSettings from "../routes/TeamSettings.vue";
import store from "./store";

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
        path: "/profile",
        component: Profile,
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
      {
        path: "/leaderboard",
        component: Leaderboard,
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
