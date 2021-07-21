<template>
  <div class="mb-2" v-if="challenge.tags.length">
    <template v-for="tag in challenge.tags">
      <span class="badge rounded-pill bg-primary">{{ tag }}</span
      >&nbsp;
    </template>
  </div>

  <div class="mb-3 challenge-description" v-html="marked.parseInline(challenge.description)"></div>

  <div v-if="challenge.educationResources.length">
    <strong>Learning Resources: </strong>
    <ul>
      <li v-for="link in challenge.educationResources">
        <a :href="link" target="blank">{{ link }}</a>
      </li>
    </ul>
  </div>

  <p v-if="challenge.fileName">
    <strong>Challenge File:</strong><br />File Name:
    <a :href="`${config.basePath}api/static/${challenge.fileName}`" download>{{ challenge.fileName }}</a
    ><br />MD5 Hash: {{ challenge.fileHash }}
  </p>

  <p v-if="challenge.url">
    <strong>Challenge URL: </strong><a :href="challenge.url">{{ challenge.url }}</a>
  </p>

  <hr />

  <template v-if="!challengeCompletion">
    <label for="basic-url" class="form-label"
      >Enter the flag from the challenge (<a @click.prevent="showHint = !showHint" href="#">Need a hint?</a>):</label
    >
    <div class="mb-2" v-if="showHint" v-html="'<strong>Hint: </strong>' + marked.parseInline(challenge.hint)"></div>
    <div class="input-group mb-3 has-validation">
      <input type="text" class="form-control" :class="{ 'is-invalid': flagSubmissionError }" placeholder="WMG{AAAAAAAA}" v-model="flag" />
      <button class="btn" :class="`btn-${difficultyToClass(challenge.difficulty)}`" type="button" @click="submitFlag(challenge.id)">
        Submit
      </button>
      <div class="invalid-feedback">{{ flagSubmissionError }}</div>
    </div>
  </template>

  <div class="text-muted"><strong>Challenge Author: </strong>{{ challenge.author }}</div>

  <template v-if="challengeCompletion"> Completed at {{ completedAt }} </template>
</template>

<script lang="ts" setup>
import marked from "marked";
import { computed, defineProps, ref, defineEmit } from "vue";

import type { UnlockedChallenge, UserChallengeCompletion } from "../types/Challenge";

import { difficultyToClass } from "../utils/styling";

import config from "../config";
import API from "../utils/api";

const showHint = ref(false);
const flag = ref("");
const flagSubmissionError = ref("");

const emit = defineEmit(["flagSubmitted"]);

const submitFlag = async (challengeId: number) => {
  const response = await API.submitFlag(challengeId, flag.value);

  if (response === 200) {
    emit("flagSubmitted");
  }

  switch (response) {
    case 200:
      // TODO: Sikari?? pls
      //user.value = await API.getUser();
      break;
    case 429:
      flagSubmissionError.value = "Slow down! Try again in a minute.";
      break;
    case 400:
      flagSubmissionError.value = "Incorrect flag, try again!";
      break;
    default:
      flagSubmissionError.value = "Something went wrong...";
      break;
  }

  setTimeout(() => {
    flagSubmissionError.value = "";
  }, 4500);
};

const completedAt = computed(() => {
  return props.challengeCompletion ? new Date(props.challengeCompletion.completionDate).toLocaleString() : "";
});

const props = defineProps({
  challenge: {
    type: Object as () => UnlockedChallenge,
    required: true,
  },
  challengeCompletion: {
    type: Object as () => UserChallengeCompletion,
    required: false,
  },
});
</script>

<style scoped>
.challenge-description {
  white-space: pre-line;
}
</style>
