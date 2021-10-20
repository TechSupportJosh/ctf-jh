<template>
  <div class="row">
    <div class="col-12">
      <h3>Recent Solves</h3>
    </div>
  </div>
  <hr />
  <div
    v-for="solve in recentSolves"
    :class="`border-${difficultyToClass(solve.challenge.difficulty)}`"
    class="recent-solve"
    v-if="recentSolves.length"
  >
    <strong>{{ solve.user }}{{ solve.team ? ` (${solve.team})` : "" }}</strong
    >&nbsp;<strong class="text-danger" v-if="solve.isBlood">BLOODED</strong><span v-else>solved</span>&nbsp;<strong>
      {{ solve.challenge.title }}</strong
    >
    <div class="text-muted">{{ timeAgo.format(new Date(solve.solveDate)) }}</div>
  </div>
  <div v-else>No challenge solves...</div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { difficultyToClass } from "../utils/styling";
import API from "../utils/api";
import type { RecentSolve } from "../types/RecentSolve";
import timeAgo from "../utils/timeAgo";

const recentSolves = ref<RecentSolve[]>([]);

let fetchTimer: number | null = null;

onMounted(async () => {
  // fetchData();

  await fetchRecentSolves();
  fetchTimer = setInterval(fetchRecentSolves, 60 * 1000);
});

onBeforeUnmount(() => {
  if (fetchTimer !== null) clearInterval(fetchTimer);
});

const fetchRecentSolves = async () => {
  const response = await API.getRecentSolves();

  if (response) recentSolves.value = response;
};
</script>

<style scoped>
.recent-solve {
  padding-left: 1rem;
  border-left: 10px solid;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}
</style>
