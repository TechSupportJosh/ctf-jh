<template>
  <div>
    <div class="card" :class="`border-${difficultyToClass(challenge.difficulty)}`">
      <div class="card-header">
        <div class="row">
          <div class="col-10">
            <strong>{{ challenge.title }} ({{ challenge.points }} points{{ challenge.locked ? " - Locked" : "" }})</strong>
          </div>
          <div class="col-2 d-flex justify-content-end">
            <strong :class="`text-${difficultyToClass(challenge.difficulty)}`">{{ challenge.difficulty }}</strong>
          </div>
        </div>
      </div>
      <div class="card-body">
        <p class="card-text">
          <locked-challenge-component
            v-if="challenge.locked"
            :challenge="challenge"
            :requirement-challenge="requirementChallenge"
          ></locked-challenge-component>

          <unlocked-challenge-component
            v-else
            :challenge="challenge"
            :challenge-completion="challengeCompletion"
            @flag-submitted="emit('challengeCompleted')"
          ></unlocked-challenge-component>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, defineEmit } from "vue";

import type { Challenge, UserChallengeCompletion } from "../types/Challenge";

import LockedChallengeComponent from "./LockedChallenge.vue";
import UnlockedChallengeComponent from "./UnlockedChallenge.vue";

import { difficultyToClass } from "../utils/styling";

const emit = defineEmit(["challengeCompleted"]);

const props = defineProps({
  challenge: {
    type: Object as () => Challenge,
    required: true,
  },
  challengeCompletion: {
    type: Object as () => UserChallengeCompletion,
    required: false,
  },
  requirementChallenge: {
    type: Object as () => Challenge,
    required: false,
  },
  requirementChallengeCompletion: {
    type: Object as () => UserChallengeCompletion,
    required: false,
  },
});
</script>
