<template>
  <span v-if="!ctfFinished"> CTF {{ ctfStarted ? "ends" : "starts" }} in<br />{{ formattedTime }} </span><span v-else>CTF finished!</span>
</template>

<script lang="ts" setup>
import { onMounted } from "@vue/runtime-core";
import { ref } from "vue";
import store from "../plugins/store";

const startTime = new Date(store.state.config.startTime);
const endTime = new Date(store.state.config.endTime);
const formattedTime = ref("");
const ctfStarted = ref(false);
const ctfFinished = ref(false);

// https://www.sitepoint.com/creating-accurate-timers-in-javascript/
const start = new Date().getTime();
let time = -1000;

const formatTime = () => {
  time += 1000;

  const nowDate = new Date();
  ctfStarted.value = nowDate > startTime;
  ctfFinished.value = nowDate > endTime;
  const futureDate = ctfStarted ? endTime : startTime;

  if (ctfFinished.value) return;

  let delta = Math.abs(futureDate.valueOf() - nowDate.valueOf()) / 1000;

  const days = Math.floor(delta / 86400);
  delta -= days * 86400;

  const hours = Math.floor(delta / 3600) % 24;
  delta -= hours * 3600;

  const minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;

  const seconds = Math.floor(delta % 60);

  formattedTime.value = `${days}d ${hours}h ${minutes}m ${seconds}s`;

  const diff = new Date().getTime() - start - time;
  setTimeout(formatTime, 1000 - diff);
};

onMounted(() => {
  formatTime();
});
</script>
