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
        <h1 v-if="!isBlood">Nice job!</h1>
        <h1 v-if="isBlood" style="letter-spacing: 0.5rem; color: var(--bs-danger); font-size: 4rem">
          <strong data-v-b85aea3a="" style="white-space: pre"
            ><span :class="bloodCharacters[0] ? 'visible' : 'invisible'">B</span>
            <span :class="bloodCharacters[1] ? 'visible' : 'invisible'">L</span>
            <span :class="bloodCharacters[2] ? 'visible' : 'invisible'">O</span>
            <span :class="bloodCharacters[3] ? 'visible' : 'invisible'">O</span>
            <span :class="bloodCharacters[4] ? 'visible' : 'invisible'">D</span>
            <span :class="bloodCharacters[5] ? 'visible' : 'invisible'">E</span>
            <span :class="bloodCharacters[6] ? 'visible' : 'invisible'">D</span></strong
          >
        </h1>
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
            :challenge-solve="challengeSolve"
            @flag-submitted="flagSubmitted"
          ></unlocked-challenge-component>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps } from "vue";

import type { Challenge, UserChallengeSolve } from "../types/Challenge";

import LockedChallengeComponent from "./LockedChallenge.vue";
import UnlockedChallengeComponent from "./UnlockedChallenge.vue";

import { difficultyToClass } from "../utils/styling";
import store from "../plugins/store";

const showSubmitAnimation = ref(false);
const pointCountText = ref(" ");

const isBlood = ref(true);
const bloodCharacters = ref([false, false, false, false, false, false, false]);

// TODO: Change to isBlood
const flagSubmitted = (solveInfo: { blood: boolean }) => {
  showSubmitAnimation.value = true;
  isBlood.value = solveInfo.blood;

  // Type the point count
  setTimeout(() => {
    if (isBlood.value) {
      const bloodText = `BLOODED`;
      for (let i = 0; i < bloodText.length; i++) {
        setTimeout(() => {
          bloodCharacters.value[i] = true;

          if (i === bloodText.length - 1) setTimeout(startPointsAnimation, 1500);
        }, 450 * i);
      }
    } else {
      startPointsAnimation();
    }
  }, 2000);
};

const startPointsAnimation = () => {
  const text = `+${props.challenge.points} points`;

  for (let i = 1; i <= text.length; i++) {
    setTimeout(() => {
      pointCountText.value = text.substring(0, i);

      if (i === text.length) {
        setTimeout(() => {
          showSubmitAnimation.value = false;
          store.dispatch("loadUser");
          store.dispatch("loadChallenges");
        }, 2000);
      }
    }, 100 * i);
  }
};

const props = defineProps({
  challenge: {
    type: Object as () => Challenge,
    required: true,
  },
  challengeSolve: {
    type: Object as () => UserChallengeSolve,
    required: false,
  },
  requirementChallenge: {
    type: Object as () => Challenge,
    required: false,
  },
  requirementChallengeSolve: {
    type: Object as () => UserChallengeSolve,
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

h1 {
  margin-bottom: 0;
}
</style>
