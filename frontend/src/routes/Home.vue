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
    <hr />
    <div class="row mb-4">
      <div class="col-sm-4 offset-2">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-text">{{ pointTotal }}</h5>
            <p class="card-text text-muted">Total Points</p>
          </div>
        </div>
      </div>
      <div class="col-sm-4">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-text">{{ user?.completed_challenges.length ?? 0 }}</h5>
            <p class="card-text text-muted">Flags Submitted</p>
          </div>
        </div>
      </div>
    </div>
    <div class="form-check form-switch mb-1">
      <input class="form-check-input" type="checkbox" v-model="hideCompletedChallenges" />
      <label class="form-check-label">Hide completed challenges</label>
    </div>
    <hr />
    <div v-for="(challenges, category) in categorisedChallenges" :key="category" class="mb-4">
      <h3>{{ category }}</h3>
      <div class="accordion" id="challenge-accordion">
        <div class="accordion-item" v-for="challenge in challenges" :key="challenge.id">
          <h2 class="accordion-header" :id="`challenge-${challenge.id}`">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              :data-bs-target="`#challenge-body-${challenge.id}`"
            >
              {{ getChallengeIcon(challenge) }} {{ challenge.title }} - {{ challenge.points }} points&nbsp;&nbsp;
              <span class="badge rounded-pill" :class="difficultyToClass(challenge.difficulty)">{{ challenge.difficulty }}</span>
            </button>
          </h2>
          <div :id="`challenge-body-${challenge.id}`" class="accordion-collapse collapse" data-bs-parent="#challenge-accordion">
            <div class="accordion-body">
              <div class="mb-2" v-if="challenge.tags">
                <template v-for="tag in challenge.tags">
                  <span class="badge rounded-pill bg-primary">{{ tag }}</span
                  >&nbsp;
                </template>
              </div>

              <template v-if="!challenge.locked">
                <div class="mb-3 challenge-description" v-html="marked.parseInline(challenge.description)"></div>
                <div v-if="challenge.education_links">
                  <strong>Learning Resources: </strong>
                  <ul>
                    <li v-for="link in challenge.education_links">
                      <a :href="link">{{ link }}</a>
                    </li>
                  </ul>
                </div>
                <p v-if="challenge.file_name">
                  <strong>Challenge File:</strong><br />File Name:
                  <a :href="`${config.basePath}api/static/${challenge.file_name}`" download>{{ challenge.file_name }}</a
                  ><br />SHA256 Hash: {{ challenge.file_hash }}
                </p>
                <p v-if="challenge.challenge_url">
                  <strong>Challenge URL: </strong><a :href="challenge.challenge_url">{{ challenge.challenge_url }}</a>
                </p>
              </template>
              <div class="text-muted" v-if="challenge.locked">
                <strong>Requires: </strong
                ><a :href="`#challenge-${challenge.unlock_requirement}`">{{ getRequiredChallenge(challenge)?.title }}</a>
              </div>
              <hr />
              <template v-if="!getCompletedEntry(challenge.id) && !challenge.locked">
                <label for="basic-url" class="form-label"
                  >Enter the flag from the challenge (<a
                    @click.prevent="showChallengeHint[challenge.id] = !showChallengeHint[challenge.id]"
                    href="#"
                    >Need a hint?</a
                  >):</label
                >
                <div
                  class="mb-2"
                  v-if="showChallengeHint[challenge.id]"
                  v-html="'<strong>Hint: </strong>' + marked.parseInline(challenge.hint)"
                ></div>
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
              <div class="text-muted"><strong>Challenge Author: </strong>{{ challenge.author }}</div>
              <template v-if="getCompletedEntry(challenge.id)"> Completed at {{ getCompletedAt(challenge.id) }} </template>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!filteredChallenges.length" class="text-center text-muted">No challenges available...</div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, computed, watch } from "vue";
import type { Challenge, LockedChallenge } from "../types/Challenge";
import type { User } from "../types/User";
import API from "../utils/api";
import config from "../config";
import marked from "marked";

const user = ref<User>();

const challenges = ref<(Challenge | LockedChallenge)[]>([]);
const challengeFlags = reactive<Record<number, string>>({});
const challengeErrors = reactive<Record<number, string>>({});
const showChallengeHint = reactive<Record<number, boolean>>({});
const hideCompletedChallenges = ref(localStorage.getItem("hideCompletedChallenges") === "1");

onMounted(async () => {
  user.value = await API.getUser();

  const response = await API.getChallenges();

  if (response) challenges.value = response;
});

watch(hideCompletedChallenges, (newValue) => {
  localStorage.setItem("hideCompletedChallenges", newValue ? "1" : "0");
});

const pointTotal = computed(() => {
  return user.value?.completed_challenges
    .map((completedChallenge) => {
      return challenges.value?.find((challenge) => challenge.id === completedChallenge.challenge_id)?.points ?? 0;
    })
    .reduce((value, total) => total + value, 0);
});

const filteredChallenges = computed(() => {
  if (!hideCompletedChallenges.value) return challenges.value;

  return challenges.value.filter((challenge) => !getCompletedEntry(challenge.id));
});

const categorisedChallenges = computed(() => {
  const filteredCategories: Record<string, (Challenge | LockedChallenge)[]> = {};

  filteredChallenges.value.forEach((challenge) => {
    if (!(challenge.category in filteredCategories)) filteredCategories[challenge.category] = [];

    filteredCategories[challenge.category].push(challenge);
  });

  Object.values(filteredCategories).forEach((challenges) => {
    challenges.sort((a, b) => a.title.localeCompare(b.title) || a.difficulty.localeCompare(b.difficulty));
  });
  return filteredCategories;
});

const getChallengeIcon = (challenge: Challenge | LockedChallenge) => {
  if (challenge.locked) return "🔒";

  return getCompletedEntry(challenge.id) ? "✅" : "";
};

const getCompletedEntry = (challengeId: number) => {
  return user.value?.completed_challenges.find((challenge) => challenge.challenge_id === challengeId);
};

const getRequiredChallenge = (lockedChallenge: LockedChallenge) => {
  return challenges.value.find((challenge) => challenge.id === lockedChallenge.unlock_requirement);
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
