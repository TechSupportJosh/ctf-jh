<template>
  <div>
    <div class="card" :class="`border-${difficultyToClass(challenge.difficulty)}`">
      <div class="card-header">
        <div class="row">
          <div class="col-10">{{ challenge.title }} ({{ challenge.points }} points{{ challenge.locked ? " - Locked" : "" }})</div>
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
  <!--
  <div class="accordion-item">
    <h2 class="accordion-header" :id="`challenge-${challenge.id}`">
      <button
        class="accordion-button collapsed"
        type="button"
        data-bs-toggle="collapse"
        :data-bs-target="`#challenge-body-${challenge.id}`"
      >

      </button>
    </h2>
    <div :id="`challenge-body-${challenge.id}`" class="accordion-collapse collapse" data-bs-parent="#challenge-accordion">

    </div>
  </div>-->
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
