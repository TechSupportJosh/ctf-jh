<template>
  <div class="row">
    <div class="col-12">
      <h3>Recent Solves</h3>
    </div>
  </div>
  <hr />
  <div
    v-for="completion in recentCompletions"
    :class="`border-${difficultyToClass(completion.challenge.difficulty)}`"
    class="recent-completion"
    v-if="recentCompletions.length"
  >
    <strong>{{ completion.user }}</strong
    >&nbsp;<strong class="text-danger" v-if="completion.isBlood">BLOODED</strong><span v-else>solved</span>&nbsp;<strong>
      {{ completion.challenge.title }}</strong
    >
    <div class="text-muted">{{ timeAgo.format(new Date(completion.completionDate)) }}</div>
  </div>
  <div v-else>No challenge solves...</div>
</template>

<script lang="ts" setup>
import TimeAgo from "javascript-time-ago";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { difficultyToClass } from "../utils/styling";
import en from "javascript-time-ago/locale/en";
import API from "../utils/api";
import type { RecentCompletion } from "../types/RecentCompletion";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

const recentCompletions = ref<RecentCompletion[]>([]);

let fetchTimer: number | null = null;

onMounted(async () => {
  // fetchData();

  await fetchRecentCompletions();
  fetchTimer = setInterval(fetchRecentCompletions, 60 * 1000);
});

onBeforeUnmount(() => {
  if (fetchTimer !== null) clearInterval(fetchTimer);
});

const fetchRecentCompletions = async () => {
  const response = await API.getRecentCompletions();

  if (response) recentCompletions.value = response;
};
</script>

<style>
.recent-completion {
  padding-left: 1rem;
  border-left: 10px solid;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}
</style>
