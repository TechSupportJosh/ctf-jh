<template>
  <div class="row">
    <div class="col-6">
      <h3>
        Viewing <span class="text-capitalize">{{ category }}</span> challenges
      </h3>
    </div>
    <div class="col-6 d-flex align-items-center justify-content-end">
      <div class="form-check form-switch mb-1">
        <input class="form-check-input" type="checkbox" v-model="hideSolvedChallenges" />
        <label class="form-check-label">Hide solved challenges</label>
      </div>
    </div>
  </div>
  <hr />
  <div class="row">
    <div class="col-auto d-flex align-items-center justify-content-center">Filter challenges:</div>
    <div class="col" v-for="difficulty in ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard']">
      <button class="btn w-100" :class="buttonClass(difficulty)" @click="showDifficulty[difficulty] = !showDifficulty[difficulty]">
        {{ difficulty }}
      </button>
    </div>
  </div>
  <hr />
  <div id="challenge-container">
    <challenge-component
      v-for="challenge in filteredChallenges"
      :key="challenge.id"
      :challenge="challenge"
      :challenge-solve="getSolvedEntry(challenge)"
      :requirement-challenge="getRequiredChallenge(challenge)"
      :requirement-challenge-solve="getRequiredSolvedEntry(challenge)"
      class="challenge mb-4"
    ></challenge-component>
  </div>
  <div v-if="!filteredChallenges.length" class="text-center text-muted">No challenges available...</div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from "vue";
import store from "../plugins/store";
import type { Challenge } from "../types/Challenge";
import ChallengeComponent from "../components/Challenge.vue";
import { useRoute } from "vue-router";
import { difficultyToClass } from "../utils/styling";

const user = computed(() => store.state.user);
const challenges = computed(() => store.state.challenges);

const currentRoute = useRoute();
const category = ref<string>();

const showDifficulty = reactive<Record<string, boolean>>({
  "Very Easy": true,
  Easy: true,
  Medium: true,
  Hard: true,
  "Very Hard": true,
});

const buttonClass = (difficulty: string) => {
  return showDifficulty[difficulty] ? `btn-${difficultyToClass(difficulty)}` : "bg-dark";
};
watch(
  () => currentRoute.params,
  (toParams) => {
    category.value = toParams.category?.toString() ?? "";
  },
  { immediate: true }
);

const hideSolvedChallenges = computed(() => store.state.hideSolvedChallenges);

const getRequiredSolvedEntry = ({ unlockRequirement }: Challenge) => {
  return user.value?.solvedChallenges.find((challenge) => challenge.challengeId === unlockRequirement);
};

const getRequiredChallenge = ({ unlockRequirement }: Challenge) => {
  return challenges.value.find((challenge) => challenge.id === unlockRequirement);
};

const filteredChallenges = computed(() => {
  const selectedChallenges = challenges.value
    .filter((challenge) => challenge.category === category.value && showDifficulty[challenge.difficulty])
    .sort((a, b) => a.title.localeCompare(b.title) || a.difficulty.localeCompare(b.difficulty));

  if (!hideSolvedChallenges.value) return selectedChallenges;

  return selectedChallenges.filter((challenge) => !getSolvedEntry(challenge));
});

const getSolvedEntry = ({ id }: Challenge) => {
  return user.value?.solvedChallenges.find((challenge) => challenge.challengeId === id);
};
</script>
