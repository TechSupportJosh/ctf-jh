import { createApp } from "vue";
import App from "./App.vue";
import router from "./plugins/router";

import "bootstrap/dist/js/bootstrap.min.js";

const app = createApp(App);
app.use(router);
app.mount("#app");
