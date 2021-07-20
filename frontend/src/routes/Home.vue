<template>
  <div class="container">
    <div class="row">
      <div class="col-8">
        <h1>Intake CTF</h1>
        <label class="text-muted">{{ user?.firstName }} {{ user?.lastName }}</label>
      </div>
      <div class="col-4 d-flex align-items-center justify-content-end" style="flex-">
        <div>
          <template v-if="user?.isAdmin"> <router-link to="/admin">Admin Panel</router-link>&nbsp;&nbsp;</template>
          <a :href="`${config.basePath}api/auth/logout`">Log Out</a>
        </div>
      </div>
    </div>
    <hr />
    <div class="row mb-4">
      <div class="col-sm-4 offset-2">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-text">{{ pointTotal }}</h5>
            <p class="card-text text-muted">Total Points</p>
          </div>
        </div>
      </div>
      <div class="col-sm-4">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-text">{{ user?.completedChallenges.length ?? 0 }}</h5>
            <p class="card-text text-muted">Flags Submitted</p>
          </div>
        </div>
      </div>
    </div>
    <div class="form-check form-switch mb-1">
      <input class="form-check-input" type="checkbox" v-model="hideCompletedChallenges" />
      <label class="form-check-label">Hide completed challenges</label>
    </div>
    <hr />
    <div v-for="(challenges, category) in categorisedChallenges" :key="category" class="mb-4">
      <h3>{{ category }}</h3>
      <div class="accordion" id="challenge-accordion">
        <challenge-component
          v-for="challenge in challenges"
          :key="challenge.id"
          :challenge="challenge"
          :challenge-completion="getCompletedEntry(challenge)"
          :requirement-challenge="getRequiredChallenge(challenge)"
          :requirement-challenge-completion="getRequiredCompletedEntry(challenge)"
          @challenge-completed="fetchData"
        ></challenge-component>
      </div>
    </div>
    <div v-if="!filteredChallenges.length" class="text-center text-muted">No challenges available...</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";

import type { Challenge } from "../types/Challenge";
import type { User } from "../types/User";

import ChallengeComponent from "../components/Challenge.vue";
import config from "../config";
import API from "../utils/api";

const user = ref<User>();

const challenges = ref<Challenge[]>([]);
const hideCompletedChallenges = ref(localStorage.getItem("hideCompletedChallenges") === "1");

onMounted(async () => {
  fetchData();
});

const fetchData = async () => {
  user.value = await API.getUser();
  const response = await API.getChallenges();

  if (response) challenges.value = response;
};

watch(hideCompletedChallenges, (newValue) => {
  localStorage.setItem("hideCompletedChallenges", newValue ? "1" : "0");
});

const pointTotal = computed(() => {
  return user.value?.completedChallenges
    .map((completedChallenge) => {
      return challenges.value?.find((challenge) => challenge.id === completedChallenge.challengeId)?.points ?? 0;
    })
    .reduce((value, total) => total + value, 0);
});

const filteredChallenges = computed(() => {
  if (!hideCompletedChallenges.value) return challenges.value;

  return challenges.value.filter((challenge) => !getCompletedEntry(challenge));
});

const categorisedChallenges = computed(() => {
  const filteredCategories: Record<string, Challenge[]> = {};

  filteredChallenges.value.forEach((challenge) => {
    if (!(challenge.category in filteredCategories)) filteredCategories[challenge.category] = [];

    filteredCategories[challenge.category].push(challenge);
  });

  Object.values(filteredCategories).forEach((challenges) => {
    challenges.sort((a, b) => a.title.localeCompare(b.title) || a.difficulty.localeCompare(b.difficulty));
  });
  return filteredCategories;
});

const getCompletedEntry = ({ id }: Challenge) => {
  return user.value?.completedChallenges.find((challenge) => challenge.challengeId === id);
};

const getRequiredCompletedEntry = ({ unlockRequirement }: Challenge) => {
  return user.value?.completedChallenges.find((challenge) => challenge.challengeId === unlockRequirement);
};

const getRequiredChallenge = ({ unlockRequirement }: Challenge) => {
  return challenges.value.find((challenge) => challenge.id === unlockRequirement);
};
</script>

<style scoped>
.challenge-description {
  white-space: pre-line;
}
</style>
