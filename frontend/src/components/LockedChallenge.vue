<template>
  <div class="text-muted" v-if="challenge.locked">
    <strong>Requires: </strong><span class="text-white">{{ requirementChallenge?.title }}</span>
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
    type: Object as () => Challenge,
    required: false,
  },
});
</script>
