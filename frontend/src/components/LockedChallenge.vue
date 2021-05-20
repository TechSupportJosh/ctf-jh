<template>
  <div class="text-muted" v-if="challenge.locked">
    <strong>Requires: </strong><a :href="`#challenge-${challenge.unlock_requirement}`">{{ requirementChallenge?.title }}</a>
  </div>
  <hr />
  <div class="text-muted"><strong>Challenge Author: </strong>{{ challenge.author }}</div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";

import type { LockedChallenge, Challenge } from "../types/Challenge";

defineProps({
  challenge: {
    type: Object as () => LockedChallenge,
    required: true,
  },
  requirementChallenge: {
    type: Object as () => Challenge | undefined,
    required: true,
  },
});
</script>
