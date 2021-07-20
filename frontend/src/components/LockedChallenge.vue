<template>
  <div class="text-muted" v-if="challenge.locked">
    <strong>Requires: </strong
    ><a :href="`#challenge-${challenge.unlockRequirement}`" @click="openRequirementChallenge(challenge)">{{
      requirementChallenge?.title
    }}</a>
  </div>
  <hr />
  <div class="text-muted"><strong>Challenge Author: </strong>{{ challenge.author }}</div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";

import type { LockedChallenge, Challenge } from "../types/Challenge";

const openRequirementChallenge = ({ unlockRequirement }: Challenge) => {
  const accordion = document.getElementById(`challenge-${unlockRequirement}`);
  if (!accordion) return;

  const button = accordion.children[0] as HTMLElement | null;
  if (button?.classList.contains("collapsed")) button.click();
};

defineProps({
  challenge: {
    type: Object as () => LockedChallenge,
    required: true,
  },
  requirementChallenge: {
    type: Object as () => Challenge,
    required: false,
  },
});
</script>
