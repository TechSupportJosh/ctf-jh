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
    <a :href="`${config.basePath}api/challenges/${challenge.id}/file`" download>{{ challenge.fileName }}</a
    ><br />MD5 Hash: {{ challenge.fileHash }}
  </p>

  <p v-if="challenge.url">
    <strong>Challenge IP: </strong>
    <pre class="challenge-url" @click="copyURL()">{{ challenge.url }}</pre>
    <span class="text-success" style="font-size: 0.875em;" v-if="showCopiedMessage">    Copied to clipboard</span>
  </p>

  <hr />

  <template v-if="!challengeSolve">
    <label class="form-label"
      >Enter the flag from the challenge<template v-if="challenge.hint">
        (<a @click.prevent="showHint = !showHint" href="#">Need a hint?</a>)</template
      >:</label
    >
    <div class="mb-2" v-if="showHint" v-html="'<strong>Hint: </strong>' + marked.parseInline(challenge.hint)"></div>

    <flag-string
      :challenge="challenge"
      :flag-submission-error="flagSubmissionError"
      v-if="challenge.flagType === 'string'"
      @flag-submitted="submitFlag"
    ></flag-string>
    <flag-location
      :challenge="challenge"
      :flag-submission-error="flagSubmissionError"
      v-if="challenge.flagType === 'location'"
      @flag-submitted="submitFlag"
    ></flag-location>
  </template>

  <div class="d-flex d-flex justify-content-between">
    <div><strong class="text-muted">Challenge Author: </strong>{{ challenge.author }}</div>
    <div><strong class="text-muted">Solves: </strong>{{ challenge.solveCount }}</div>
  </div>

  <template v-if="challengeSolve"
    ><strong class="text-muted">{{ solvedByLabel }}</strong
    >{{ solvedAt }}</template
  >
</template>

<script lang="ts" setup>
import marked from "marked";
import { computed, defineProps, ref, defineEmit } from "vue";

import type { UnlockedChallenge, UserChallengeSolve } from "../types/Challenge";

import config from "../config";
import API from "../utils/api";
import FlagString from "./flagInputs/String.vue";
import FlagLocation from "./flagInputs/Location.vue";
import store from "../plugins/store";
import copyToClipboard from "copy-to-clipboard";

const showHint = ref(false);
const showCopiedMessage = ref(false);
const flagSubmissionError = ref("");
const user = computed(() => store.state.user);
const team = computed(() => store.state.team);

const emit = defineEmit(["flagSubmitted"]);

let errorTimer: number | null = null;

const solvedByLabel = computed(() => {
  if (props.challengeSolve!.userId !== user.value!.id) {
    // If not solved by user, it must have been solved by a team member
    const solver = team.value?.members.find((member) => member.id === props.challengeSolve!.userId);
    if (solver) return `Solved by ${solver.firstName} ${solver.lastName} at: `;
  }

  return `Solved at: `;
});

const submitFlag = async (flag: string) => {
  const response = await API.submitFlag(props.challenge.id, flag);

  switch (response.statusCode) {
    case 200:
      emit("flagSubmitted", { blood: response.isBlood });
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

  if (errorTimer !== null) {
    clearTimeout(errorTimer);
    errorTimer = null;
  }

  errorTimer = setTimeout(() => {
    flagSubmissionError.value = "";
  }, 4500);
};

const solvedAt = computed(() => {
  return props.challengeSolve ? new Date(props.challengeSolve.solveDate).toLocaleString() : "";
});

const copyURL = () => {
  copyToClipboard(props.challenge.url!);
  showCopiedMessage.value = true;
  setTimeout(() => {
    showCopiedMessage.value = false;
  }, 3000);
};

const props = defineProps({
  challenge: {
    type: Object as () => UnlockedChallenge,
    required: true,
  },
  challengeSolve: {
    type: Object as () => UserChallengeSolve,
    required: false,
  },
});
</script>

<style scoped>
.challenge-description {
  white-space: pre-line;
}

.challenge-url {
  font-size: 1em; 
  display: inline;
  cursor: pointer;
  margin-left: 5px;
  padding: 5px;
  background-color: #20374c;
}
</style>
