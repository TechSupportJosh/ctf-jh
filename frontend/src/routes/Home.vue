<template>
  <main>
    <div class="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" id="sidebar">
      <div class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white flex-column">
        <span class="fs-4">Intake CTF</span>
        <router-link v-if="user?.isAdmin" to="/admin">Admin Panel</router-link>
      </div>
      <hr />
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item text-center">{{ pointTotal }} Points<br />{{ user?.completedChallenges.length ?? 0 }} Challenges Owned</li>
        <hr />
        <li class="nav-item mb-2"><strong>Categories:</strong></li>
        <li class="nav-item" v-for="category in challengeCategories">
          <a
            href="#"
            class="nav-link"
            :class="category == selectedCategory ? 'active' : ''"
            aria-current="page"
            @click="selectedCategory = category"
          >
            {{ category }}
          </a>
        </li>
      </ul>
      <hr />
      <div>
        <strong>{{ user?.firstName }} {{ user?.lastName }}</strong
        ><br />
        <a :href="`${config.basePath}api/auth/logout`" class="text-white">Log Out</a>
      </div>
    </div>
    <div class="container mt-4" id="main-container">
      <div class="row">
        <div class="col-6">
          <h3>Viewing {{ selectedCategory }} challenges</h3>
        </div>
        <div class="col-6 d-flex align-items-center justify-content-end">
          <div class="form-check form-switch mb-1">
            <input class="form-check-input" type="checkbox" v-model="hideCompletedChallenges" />
            <label class="form-check-label">Hide completed challenges</label>
          </div>
        </div>
      </div>
      <hr />
      <div id="challenge-container">
        <challenge-component
          v-for="challenge in filteredChallenges"
          :key="challenge.id"
          :challenge="challenge"
          :challenge-completion="getCompletedEntry(challenge)"
          :requirement-challenge="getRequiredChallenge(challenge)"
          :requirement-challenge-completion="getRequiredCompletedEntry(challenge)"
          @challenge-completed="fetchData"
          class="challenge mb-4"
        ></challenge-component>
      </div>
      <div v-if="!filteredChallenges.length" class="text-center text-muted">No challenges available...</div>
    </div>
  </main>
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
const selectedCategory = ref(localStorage.getItem("selectedCategory"));
const challengeCategories = ref<string[]>([]);

onMounted(async () => {
  fetchData();
});

const fetchData = async () => {
  user.value = await API.getUser();
  const response = await API.getChallenges();

  if (response) {
    challenges.value = response;

    const categories = new Set<string>();
    challenges.value.forEach((challenge) => {
      categories.add(challenge.category);
    });

    challengeCategories.value = [...categories];

    if (!categories.has(selectedCategory.value ?? "")) {
      selectedCategory.value = [...categories][0];
    }
  }
};

watch(hideCompletedChallenges, (newValue) => {
  localStorage.setItem("hideCompletedChallenges", newValue ? "1" : "0");
});

watch(selectedCategory, (newValue) => {
  localStorage.setItem("selectedCategory", newValue ?? "");
});

const pointTotal = computed(() => {
  return user.value?.completedChallenges
    .map((completedChallenge) => {
      return challenges.value?.find((challenge) => challenge.id === completedChallenge.challengeId)?.points ?? 0;
    })
    .reduce((value, total) => total + value, 0);
});

const filteredChallenges = computed(() => {
  const selectedChallenges = challenges.value
    .filter((challenge) => challenge.category === selectedCategory.value)
    .sort((a, b) => a.title.localeCompare(b.title) || a.difficulty.localeCompare(b.difficulty));

  if (!hideCompletedChallenges.value) return selectedChallenges;

  return selectedChallenges.filter((challenge) => !getCompletedEntry(challenge));
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
#app {
  height: 100vh;
}
main {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}

#sidebar {
  width: 280px;
  position: fixed;
  height: 100vh;
}

#main-container {
  padding-left: 280px;
}
</style>
