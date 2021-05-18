<template>
  <div class="container">
    <div class="row">
      <div class="col-8">
        <h1>Intake CTF</h1>
      </div>
      <div class="col-4 d-flex align-items-center justify-content-end" style="flex-">
        <div>
          <template v-if="user?.is_admin"> <router-link to="/admin">Admin Panel</router-link>&nbsp;&nbsp;</template>
          <a :href="`${config.basePath}api/auth/logout`">Log Out</a>
        </div>
      </div>
    </div>
    <div v-for="(challenges, category) in categorisedChallenges" :key="category" class="mb-4">
      <h3>{{ category }}</h3>
      <div class="accordion" id="challenge-accordion">
        <div class="accordion-item" v-for="challenge in challenges" :key="challenge.id">
          <h2 class="accordion-header">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              :data-bs-target="`#challenge-${challenge.id}`"
            >
              {{ getCompletedEntry(challenge.id) ? "✅" : "" }} {{ challenge.title }} - {{ challenge.points }} points&nbsp;&nbsp;
              <span class="badge rounded-pill" :class="difficultyToClass(challenge.difficulty)">{{ challenge.difficulty }}</span>
            </button>
          </h2>
          <div :id="`challenge-${challenge.id}`" class="accordion-collapse collapse" data-bs-parent="#challenge-accordion">
            <div class="accordion-body">
              <div class="mb-2" v-if="challenge.tags">
                <template v-for="tag in challenge.tags">
                  <span class="badge rounded-pill bg-primary">{{ tag }}</span
                  >&nbsp;
                </template>
              </div>
              <div class="mb-3 challenge-description" v-html="marked.parseInline(challenge.description)"></div>
              <p v-if="challenge.file_name">
                <strong>Challenge File:</strong><br />File Name: <a :href="`/static/${challenge.file_name}`">{{ challenge.file_name }}</a
                ><br />SHA256 Hash: {{ challenge.file_hash }}
              </p>
              <p v-if="challenge.challenge_url">
                <strong>Challenge URL: </strong><a :href="challenge.challenge_url">{{ challenge.challenge_url }}</a>
              </p>
              <hr />
              <template v-if="!getCompletedEntry(challenge.id)">
                <label for="basic-url" class="form-label">Enter the flag from the challenge:</label>
                <div class="input-group mb-3 has-validation">
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': challengeErrors[challenge.id] }"
                    placeholder="WMG{AAAAAAAA}"
                    v-model="challengeFlags[challenge.id]"
                  />
                  <button class="btn btn-success" type="button" @click="submitFlag(challenge.id)">Submit</button>
                  <div class="invalid-feedback">{{ challengeErrors[challenge.id] }}</div>
                </div>
              </template>
              <template v-else> Completed at {{ getCompletedAt(challenge.id) }} </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from "vue";
import type { Challenge } from "../types/Challenge";
import type { User } from "../types/User";
import API from "../utils/api";
import config from "../config";
import marked from "marked";

const user = ref<User>();

const challenges = ref<Challenge[]>();
const categorisedChallenges = ref<Record<string, Challenge[]>>({});
const challengeFlags = reactive<Record<number, string>>({});
const challengeErrors = reactive<Record<number, string>>({});

onMounted(async () => {
  user.value = await API.getUser();

  challenges.value = await API.getChallenges();

  challenges.value?.forEach((challenge) => {
    if (!(challenge.category in categorisedChallenges.value)) categorisedChallenges.value[challenge.category] = [];

    categorisedChallenges.value[challenge.category].push(challenge);
  });
});

const getCompletedEntry = (challengeId: number) => {
  return user.value?.completed_challenges.find((challenge) => challenge.challenge_id === challengeId);
};

const getCompletedAt = (challengeId: number) => {
  const completedEntry = getCompletedEntry(challengeId);
  if (!completedEntry) return "";

  return new Date(completedEntry.time_completed * 1000).toLocaleString();
};

const submitFlag = async (challengeId: number) => {
  const response = await API.submitFlag(challengeId, challengeFlags[challengeId]);

  switch (response) {
    case 200:
      user.value = await API.getUser();
      break;
    case 429:
      challengeErrors[challengeId] = "Slow down! Try again in a minute.";
      break;
    case 400:
      challengeErrors[challengeId] = "Incorrect flag, try again!";
      break;
    default:
      challengeErrors[challengeId] = "Something went wrong...";
      break;
  }

  setTimeout(() => {
    challengeErrors[challengeId] = "";
  }, 4500);
};

const difficultyToClass = (difficulty: string) => {
  return (
    {
      "Very Easy": "bg-info",
      Easy: "bg-success",
      Medium: "bg-warning",
      Hard: "bg-danger",
      "Very Hard": "bg-dark",
    }[difficulty] ?? ""
  );
};
</script>

<style scoped>
.challenge-description {
  white-space: pre-line;
}
</style>
