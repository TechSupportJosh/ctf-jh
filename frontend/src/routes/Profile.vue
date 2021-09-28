<template>
  <template v-if="user">
    <div class="row">
      <div class="col-12">
        <h3>{{ isSelf ? "Your" : "Viewing" }} Profile</h3>
      </div>
    </div>
    <hr />
    <h3 class="text-center">
      <strong>{{ user.firstName }} {{ user.lastName }}</strong>
    </h3>
    <h3 class="text-center">{{ pointTotal }} Points</h3>
    <h5 class="text-center">
      {{ user.solvedChallenges.length }} Solves -
      {{ user.solvedChallenges.filter((solvedChallenge) => solvedChallenge.isBlood).length }} Bloods
    </h5>
    <hr />
    <template v-if="hasCTFStarted">
      <h4 class="text-center">Stats</h4>
      <stats-graph :stats="stats" v-if="stats" class="mb-4"></stats-graph>
      <h4 class="text-center">Attempts</h4>
      <solve-attempts-graph :solve-attempts="user.solveAttempts" class="mb-4"></solve-attempts-graph>
      <h4 class="text-center">Challenge Breakdown</h4>
      <category-breakdown-graph :solved-challenges="user.solvedChallenges" class="mb-4"></category-breakdown-graph>
      <h4 class="text-center">Challenges Solved</h4>
      <table class="table" style="font-size: 1em">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th>Challenge</th>
            <th>Category</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="solve in user.solvedChallenges">
            <th scope="row">{{ new Date(solve.solveDate).toLocaleString() }}</th>
            <td>{{ challenges.find((challenge) => challenge.id === solve.challengeId)?.title }}</td>
            <td>{{ challenges.find((challenge) => challenge.id === solve.challengeId)?.category }}</td>
            <td>{{ challenges.find((challenge) => challenge.id === solve.challengeId)?.points }}</td>
          </tr>
        </tbody>
      </table>
    </template>
    <template v-else>
      <p class="text-muted text-center">Your stats will appear once the CTF has started.</p>
    </template>
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
import { useRoute } from "vue-router";
import type { User } from "../types/User";

const user = ref<User>();
const challenges = computed(() => store.state.challenges);
const stats = ref<SolveStats[]>();
const isSelf = ref(false);

onMounted(async () => {
  const route = useRoute();
  if (route.params["profileId"]) {
    const profileId = parseInt(route.params["profileId"].toString());
    if (!isNaN(profileId)) {
      const response = await API.getUser(profileId);
      if (response) user.value = response;
    }
  }

  if (!user.value) {
    user.value = store.state.user!;
    isSelf.value = true;
  }

  const response = await API.getStats(user.value.id);

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
