<template>
  <div class="row">
    <div class="col-6">
      <h3>
        Viewing <span class="text-capitalize">{{ category }}</span> challenges
      </h3>
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
      class="challenge mb-4"
    ></challenge-component>
  </div>
  <div v-if="!filteredChallenges.length" class="text-center text-muted">No challenges available...</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import store from "../plugins/store";
import type { Challenge } from "../types/Challenge";
import ChallengeComponent from "../components/Challenge.vue";
import { useRoute } from "vue-router";

const user = computed(() => store.state.user);
const challenges = computed(() => store.state.challenges);

const currentRoute = useRoute();
const category = ref<string>();

watch(
  () => currentRoute.params,
  (toParams) => {
    category.value = toParams.category?.toString() ?? "";
  },
  { immediate: true }
);

const hideCompletedChallenges = computed(() => store.state.hideCompletedChallenges);

const getRequiredCompletedEntry = ({ unlockRequirement }: Challenge) => {
  return user.value?.completedChallenges.find((challenge) => challenge.challengeId === unlockRequirement);
};

const getRequiredChallenge = ({ unlockRequirement }: Challenge) => {
  return challenges.value.find((challenge) => challenge.id === unlockRequirement);
};

const filteredChallenges = computed(() => {
  const selectedChallenges = challenges.value
    .filter((challenge) => challenge.category === category.value)
    .sort((a, b) => a.title.localeCompare(b.title) || a.difficulty.localeCompare(b.difficulty));

  if (!hideCompletedChallenges.value) return selectedChallenges;

  return selectedChallenges.filter((challenge) => !getCompletedEntry(challenge));
});

const getCompletedEntry = ({ id }: Challenge) => {
  return user.value?.completedChallenges.find((challenge) => challenge.challengeId === id);
};
</script>
