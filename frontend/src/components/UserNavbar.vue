<template>
  <div class="collapse navbar-collapse" id="navbar">
    <ul class="navbar-nav navbar-nav-scroll nav-pills sflex-column mb-auto">
      <hr />
      <li class="nav-item text-center">
        {{ pointTotal }} Points<br />{{ user?.solvedChallenges.length ?? 0 }} Challenges Solved<br /><br /><c-t-f-timer></c-t-f-timer>
      </li>
      <hr />
      <li class="nav-item mb-2"><strong>Categories:</strong></li>
      <li class="nav-item" v-for="(challengeCount, category) in categories">
        <router-link :to="`/challenges/${category}`" class="nav-link" active-class="active" aria-current="page">
          {{ category }} ({{ challengeCount }})
        </router-link>
      </li>
      <hr />
      <li class="nav-item"><router-link to="/profile" class="nav-link" active-class="active">Profile</router-link></li>
      <li class="nav-item"><router-link to="/team" class="nav-link" active-class="active">Team</router-link></li>
      <li class="nav-item"><router-link to="/feed" class="nav-link" active-class="active">Recent Solves</router-link></li>
      <li class="nav-item"><router-link to="/leaderboard" class="nav-link" active-class="active">Leaderboard</router-link></li>
      <li class="nav-item"><router-link to="/help" class="nav-link" active-class="active">Help</router-link></li>
      <hr />
      <div class="w-100 text-center">
        <strong>{{ user?.firstName }} {{ user?.lastName }}</strong
        ><br />
        <a :href="`${config.basePath}api/auth/logout`" class="text-white">Log Out</a>
      </div>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import store from "../plugins/store";
import config from "../config";
import CTFTimer from "./CTFTimer.vue";

const user = computed(() => store.state.user);
const { challenges, categories } = store.state;

const pointTotal = computed(() => {
  return user.value?.solvedChallenges
    .map((solvedChallenge) => {
      return challenges.find((challenge) => challenge.id === solvedChallenge.challengeId)?.points ?? 0;
    })
    .reduce((value, total) => total + value, 0);
});
</script>
