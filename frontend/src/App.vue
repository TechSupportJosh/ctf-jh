<template>
  <div class="container">
    <h1>Intake CTF</h1>
    <div class="accordion accordion-flush" id="challenge-accordion">
      <div class="accordion-item" v-for="challenge in challenges" :key="challenge.id">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#challenge-${challenge.id}`">
            {{ getCompletedEntry(challenge.id) ? "✅" : "" }} {{ challenge.title }} - {{ challenge.points }} points
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
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, computed } from "vue";
import type { Challenge } from "./types/Challenge";
import type { User } from "./types/User";
import API from "./utils/api";

ref: user = undefined as User | undefined;

ref: challenges = undefined as Challenge[] | undefined;
const challengeFlags = reactive<Record<number, string>>({});

onMounted(async () => {
  user = await API.getUser();

  challenges = await API.getChallenges();
});

const getCompletedEntry = (challengeId: number) => {
  return user?.completed_challenges.find((challenge) => challenge.challenge_id === challengeId);
};

const getCompletedAt = (challengeId: number) => {
  const completedEntry = getCompletedEntry(challengeId);
  if (!completedEntry) return "";

  return new Date(completedEntry.time_completed * 1000).toLocaleString();
};

const submitFlag = async (challengeId: number) => {
  const response = await API.submitFlag(challengeId, challengeFlags[challengeId]);

  if (!response) alert("wrong flag bro " + response.toString());
};
</script>
