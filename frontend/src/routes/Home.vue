<template>
  <div class="container">
    <div class="row">
      <div class="col-8">
        <h1>Intake CTF</h1>
      </div>
      <div class="col-4 d-flex align-items-center justify-content-end">
        <div>
          <a href="/api/auth/logout">Log Out</a>
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
              <p>{{ challenge.description }}</p>
              <hr />
              <template v-if="!getCompletedEntry(challenge.id)">
                <label for="basic-url" class="form-label">Enter the flag from the challenge:</label>
                <div class="input-group mb-3">
                  <input type="text" class="form-control" placeholder="WMG{AAAAAAAA}" v-model="challengeFlags[challenge.id]" />
                  <button class="btn btn-success" type="button" @click="submitFlag(challenge.id)">Submit</button>
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

const user = ref<User>();

const challenges = ref<Challenge[]>();
const categorisedChallenges = ref<Record<string, Challenge[]>>({});

const challengeFlags = reactive<Record<number, string>>({});

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

  // TODO: Proper error message and only getUser() if successful
  if (!response) alert("wrong flag bro " + response.toString());
  user.value = await API.getUser();
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
