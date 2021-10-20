<template>
  <div class="row">
    <div class="col-12">
      <h3>Viewing solves for {{ challenge?.title }}</h3>
    </div>
  </div>
  <hr />
  <router-link :to="`/challenges/${challenge?.category}`">Go Back</router-link>
  <br />
  <br />
  <table class="table" style="font-size: 1em">
    <thead>
      <tr>
        <th scope="col">Date</th>
        <th scope="col">User</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(solve, index) in solves" :class="{ 'table-danger': index === 0 }">
        <th scope="row">{{ new Date(solve.solveDate).toLocaleString() }}</th>
        <td>{{ solve.user?.firstName }} {{ solve.user?.lastName }}{{ solve.user?.team ? ` (${solve.user.team.name})` : "" }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import router from "../plugins/router";
import store from "../plugins/store";
import type { Challenge, UserChallengeSolve } from "../types/Challenge";
import API from "../utils/api";

const challenges = computed(() => store.state.challenges);

const currentRoute = useRoute();
const challenge = ref<Challenge>();
const solves = ref<UserChallengeSolve[]>([]);

onMounted(async () => {
  const challengeId = parseInt(currentRoute.params.challengeId.toString());
  challenge.value = challenges.value.find((challenge) => challenge.id === challengeId);

  if (!challenge.value) return router.push("/");

  const response = await API.getChallengeSolves(challengeId);

  if (response) solves.value = response;
});
</script>
