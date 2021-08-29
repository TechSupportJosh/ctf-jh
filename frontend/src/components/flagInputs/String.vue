<template>
  <div class="input-group mb-3 has-validation">
    <input
      type="text"
      class="form-control"
      :class="{
        'is-invalid': flagSubmissionError,
      }"
      placeholder="WMG{AAAAAAAA}"
      v-model="flag"
    />
    <button class="btn" :class="`btn-${difficultyToClass(challenge.difficulty)}`" type="button" @click="emit('flagSubmitted', flag)">
      Submit
    </button>
    <div class="invalid-feedback">{{ flagSubmissionError }}</div>
  </div>
</template>

<script lang="ts" setup>
import { defineEmit, defineProps, ref } from "vue";
import type { Challenge } from "../../types/Challenge";
import { difficultyToClass } from "../../utils/styling";

const flag = ref("");

const emit = defineEmit(["flagSubmitted"]);

const props = defineProps({
  challenge: {
    type: Object as () => Challenge,
    required: true,
  },
  flagSubmissionError: {
    type: String,
  },
});
</script>
