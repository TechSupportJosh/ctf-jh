<template>
  <div class="text-muted" v-if="challenge.locked">
    <strong>Requires: </strong><span class="text-white">{{ requirementChallenge?.title }}</span>
  </div>
  <hr />
  <div class="d-flex d-flex justify-content-between">
    <div><strong class="text-muted">Challenge Author: </strong>{{ challenge.author }}</div>
    <div>
      <router-link :to="`/challenges/${challenge.id}/solves`" class="text-white"
        ><strong class="text-muted">Solves: </strong>{{ challenge.solveCount }}</router-link
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { RouterLink } from "vue-router";

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
