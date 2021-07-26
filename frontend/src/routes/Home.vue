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
        <li class="nav-item" v-for="(challengeCount, category) in challengeCategories">
          <a
            href="#"
            class="nav-link"
            :class="category == selectedCategory && viewState === 'challenges' ? 'active' : ''"
            aria-current="page"
            @click="
              selectedCategory = category;
              viewState = 'challenges';
            "
          >
            {{ category }} ({{ challengeCount }})
          </a>
        </li>
      </ul>
      <a href="" @click.prevent="viewState = 'help'">Help</a>
      <a href="" @click.prevent="viewState = 'recentFeed'">Recent Solves</a>
      <hr />
      <div>
        <strong>{{ user?.firstName }} {{ user?.lastName }}</strong
        ><br />
        <a :href="`${config.basePath}api/auth/logout`" class="text-white">Log Out</a>
      </div>
    </div>
    <div class="container mt-4" id="main-container">
      <div v-if="viewState === 'challenges'">
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
      <div v-if="viewState === 'help'">
        <c-t-f-help></c-t-f-help>
      </div>
      <div v-if="viewState === 'recentFeed'">
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
        >
          <strong>{{ completion.user }}</strong> <strong class="text-danger" v-if="completion.isBlood">BLOODED</strong
          ><span v-else>solved</span> <strong>{{ completion.challenge.title }}</strong>
          <div class="text-muted">{{ timeAgo.format(new Date(completion.completionDate)) }}</div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

import type { Challenge } from "../types/Challenge";
import type { User } from "../types/User";

import ChallengeComponent from "../components/Challenge.vue";
import config from "../config";
import API from "../utils/api";
import CTFHelp from "../components/CTFHelp.vue";
import type { RecentCompletion } from "../types/RecentCompletion";
import { difficultyToClass } from "../utils/styling";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

const user = ref<User>();

const challenges = ref<Challenge[]>([]);
const hideCompletedChallenges = ref(localStorage.getItem("hideCompletedChallenges") === "1");
const selectedCategory = ref(localStorage.getItem("selectedCategory"));
const challengeCategories = ref<Record<string, number>>({});

const viewState = ref<"challenges" | "help" | "recentFeed">("challenges");
const recentCompletions = ref<RecentCompletion[]>([]);

let fetchTimer: number | null = null;

onMounted(async () => {
  fetchData();

  await fetchRecentCompletions();
  fetchTimer = setInterval(fetchRecentCompletions, 60 * 1000);
});

onBeforeUnmount(() => {
  if (fetchTimer !== null) clearInterval(fetchTimer);
});

const fetchData = async () => {
  user.value = await API.getUser();
  const response = await API.getChallenges();

  if (response) {
    challenges.value = response;

    challenges.value.forEach((challenge) => {
      if (!(challenge.category in challengeCategories.value)) challengeCategories.value[challenge.category] = 0;

      challengeCategories.value[challenge.category]++;
    });

    if (!challengeCategories.value[selectedCategory.value ?? ""] ?? "") {
      selectedCategory.value = challenges.value[0].category;
    }
  }
};

const fetchRecentCompletions = async () => {
  const response = await API.getRecentCompletions();

  if (response) recentCompletions.value = response;
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

.recent-completion {
  padding-left: 1rem;
  border-left: 10px solid;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}
</style>
