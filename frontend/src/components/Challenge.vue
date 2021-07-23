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

      <div class="flag-submitted" :class="{ visible: showSubmitAnimation }">
        <h1>Nice job!</h1>
        <h3 :class="`text-${difficultyToClass(challenge.difficulty)}`" v-text="pointCountText"></h3>
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
            @flag-submitted="flagSubmitted"
          ></unlocked-challenge-component>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmit } from "vue";

import type { Challenge, UserChallengeCompletion } from "../types/Challenge";

import LockedChallengeComponent from "./LockedChallenge.vue";
import UnlockedChallengeComponent from "./UnlockedChallenge.vue";

import { difficultyToClass } from "../utils/styling";

const emit = defineEmit(["challengeCompleted"]);
const showSubmitAnimation = ref(false);
const pointCountText = ref(" ");

const flagSubmitted = () => {
  showSubmitAnimation.value = true;

  // Type the point count
  setTimeout(() => {
    const text = `+${props.challenge.points} points`;
    for (let i = 1; i <= text.length; i++) {
      setTimeout(() => {
        pointCountText.value = text.substring(0, i);

        if (i === text.length) {
          setTimeout(() => {
            showSubmitAnimation.value = false;
            emit("challengeCompleted");
          }, 2000);
        }
      }, 100 * i);
    }
  }, 2000);
};

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

<style scoped>
.flag-submitted {
  position: absolute;
  width: 100%;
  height: 100%;
  text-align: center;
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  opacity: 0;
  background-color: rgb(15, 37, 55);
  transition: all 1s ease;
  z-index: -10;
}

.flag-submitted.visible {
  opacity: 1;
  z-index: 10;
  transition: all 1s ease;
}
</style>
