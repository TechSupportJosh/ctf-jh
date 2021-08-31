import { createApp } from "vue";
import App from "./App.vue";
import router from "./plugins/router";
import store from "./plugins/store";

import "bootstrap/dist/js/bootstrap.min.js";
import { ServerEvent } from "./types/Events";

(async function () {
  await store.dispatch("loadUser");
  await store.dispatch("loadTeam");
  await store.dispatch("loadChallenges");
  await store.dispatch("loadConfig");

  const eventSource = new EventSource("/api/events");

  eventSource.addEventListener("message", async (event) => {
    try {
      const data = JSON.parse(event.data) as ServerEvent;
      const eventData = JSON.parse(data.payload);

      if (data.name === "fetch") {
        for (const type of eventData as string[]) {
          if (type === "user") await store.dispatch("loadUser");
          else if (type === "challenges") await store.dispatch("loadChallenges");
          else if (type === "config") await store.dispatch("loadConfig");
          else if (type === "team") await store.dispatch("loadTeam");
        }
      }
    } catch {
      console.log("Failed to parse JSON data for event stream.");
    }
  });

  const app = createApp(App);
  app.use(router);

  app.mount("#app");
})();
