<template>
  <div class="accordion-item">
    <h2 class="accordion-header" :id="`challenge-${challenge.id}`">
      <button
        class="accordion-button collapsed"
        type="button"
        data-bs-toggle="collapse"
        :data-bs-target="`#challenge-body-${challenge.id}`"
      >
        {{ challengeIcon }} {{ challenge.title }} - {{ challenge.points }} points&nbsp;&nbsp;
        <span class="badge rounded-pill" :class="difficultyToClass(challenge.difficulty)">{{ challenge.difficulty }}</span>
      </button>
    </h2>
    <div :id="`challenge-body-${challenge.id}`" class="accordion-collapse collapse" data-bs-parent="#challenge-accordion">
      <div class="accordion-body">
        <locked-challenge-component
          v-if="challenge.locked"
          :challenge="challenge"
          :requirement-challenge="requirementChallenge"
        ></locked-challenge-component>

        <unlocked-challenge-component
          v-else
          :challenge="challenge"
          :challenge-completion="challengeCompletion"
        ></unlocked-challenge-component>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps } from "vue";

import type { Challenge, UserChallengeCompletion } from "../types/Challenge";

import LockedChallengeComponent from "./LockedChallenge.vue";
import UnlockedChallengeComponent from "./UnlockedChallenge.vue";

const props = defineProps({
  challenge: {
    type: Object as () => Challenge,
    required: true,
  },
  challengeCompletion: {
    type: Object as () => UserChallengeCompletion | undefined,
    required: true,
  },
  requirementChallenge: {
    type: Object as () => Challenge | undefined,
    required: true,
  },
  requirementChallengeCompletion: {
    type: Object as () => UserChallengeCompletion | undefined,
    required: true,
  },
});

const challengeIcon = computed(() => {
  if (props.challenge.locked) return "🔒";

  return props.challengeCompletion ? "✅" : "";
});

const difficultyToClass = (difficulty: string) => {
  return (
    {
      "Very Easy": "bg-info",
      Easy: "bg-success",
      Medium: "bg-warning",
      Hard: "bg-danger",
      "Very Hard": "bg-dark",
    }[difficulty] ?? ""
  );
};
</script>
