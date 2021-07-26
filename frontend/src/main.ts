import { createApp } from "vue";
import App from "./App.vue";
import router from "./plugins/router";
import store from "./plugins/store";

import "bootstrap/dist/js/bootstrap.min.js";
import API from "./utils/api";

(async function () {
  await store.dispatch("loadUser");
  await store.dispatch("loadChallenges");

  const app = createApp(App);
  app.use(router);
  //app.use(store);

  console.log("hello");
  app.mount("#app");
})();
