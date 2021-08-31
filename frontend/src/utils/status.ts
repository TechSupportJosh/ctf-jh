import { computed } from "vue";
import store from "../plugins/store";

export const hasCTFStarted = computed(() => {
  return new Date() > new Date(store.state.config.startTime);
});

export const hasCTFFinished = computed(() => {
  return new Date() > new Date(store.state.config.endTime);
});
