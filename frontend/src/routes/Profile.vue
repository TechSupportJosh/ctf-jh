<template>
  <div class="row">
    <div class="col-12">
      <h3>Your Profile</h3>
    </div>
  </div>
  <hr />
  <h3 class="text-center"><strong>Joshua H</strong></h3>
  <h3 class="text-center">{{ pointTotal }} Points</h3>
  <hr />
  <template v-if="hasCTFStarted">
    <h4 class="text-center">Stats</h4>
    <stats-graph :stats="stats" v-if="stats" class="mb-4"></stats-graph>
    <h4 class="text-center">Attempts</h4>
    <solve-attempts-graph :solve-attempts="user.solveAttempts" class="mb-4"></solve-attempts-graph>
    <h4 class="text-center">Challenge Breakdown</h4>
    <category-breakdown-graph :solved-challenges="user.solvedChallenges"></category-breakdown-graph
  ></template>
  <template v-else>
    <p class="text-muted text-center">Your stats will appear once the CTF has started.</p>
  </template>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import store from "../plugins/store";
import API from "../utils/api";
import StatsGraph from "../components/graphs/StatsGraph.vue";
import SolveAttemptsGraph from "../components/graphs/SolveAttemptsGraph.vue";
import CategoryBreakdownGraph from "../components/graphs/CategoryBreakdownGraph.vue";
import type { SolveStats } from "../types/Stats";
import { hasCTFStarted } from "../utils/status";

const user = computed(() => store.state.user!);
const challenges = computed(() => store.state.challenges);
const stats = ref<SolveStats[]>();

onMounted(async () => {
  const response = await API.getStats();

  if (response) stats.value = response;
});

const pointTotal = computed(() => {
  return user.value?.solvedChallenges
    .map((solvedChallenge) => {
      return challenges.value.find((challenge) => challenge.id === solvedChallenge.challengeId)?.points ?? 0;
    })
    .reduce((value, total) => total + value, 0);
});
</script>
