<template>
  <div class="collapse navbar-collapse" id="navbar">
    <ul class="navbar-nav navbar-nav-scroll nav-pills sflex-column mb-auto">
      <template v-if="user?.isAdmin">
        <hr />
        <router-link to="/admin" class="btn btn-primary w-100">Admin Panel</router-link>
      </template>

      <hr />
      <li class="nav-item text-center">
        {{ pointTotal }} Points<br />{{ user?.solvedChallenges.length ?? 0 }} Challenges Solved<br /><br /><c-t-f-timer></c-t-f-timer>
      </li>
      <hr />
      <template v-if="hasCTFStarted">
        <template v-if="!maintenance">
          <li class="nav-item mb-2"><strong>Categories:</strong></li>
          <li class="nav-item" v-for="(challengeCount, category) in categories">
            <router-link :to="`/challenges/${category}`" class="nav-link" active-class="active" aria-current="page">
              {{ category }} ({{ challengeCount }})
            </router-link>
          </li></template
        >
        <template v-else>
          <li class="nav-item text-center">
            <strong>Maintenance Mode</strong><br />
            <p class="mb-2">CTF is currently in maintenance mode. Challenges are unavailable.</p>
          </li>
        </template>
        <hr />
      </template>
      <li class="nav-item"><router-link to="/profile" class="nav-link" active-class="active">Profile</router-link></li>
      <li class="nav-item">
        <router-link to="/team" class="nav-link" active-class="active">Team {{ user?.team ? `(${user?.team.name})` : "" }}</router-link>
      </li>
      <li class="nav-item" v-if="hasCTFStarted && !hasCTFFinished">
        <router-link to="/feed" class="nav-link" active-class="active">Recent Solves</router-link>
      </li>
      <li class="nav-item"><router-link to="/leaderboard" class="nav-link" active-class="active">Leaderboard</router-link></li>
      <li class="nav-item"><router-link to="/help" class="nav-link" active-class="active">Help</router-link></li>
      <li class="nav-item"><router-link to="/settings" class="nav-link" active-class="active">Settings</router-link></li>
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
import config from "../config";
import store from "../plugins/store";
import CTFTimer from "./CTFTimer.vue";
import { hasCTFStarted, hasCTFFinished } from "../utils/status";

const user = computed(() => store.state.user);
const maintenance = computed(() => store.state.config.maintenance);
const challenges = computed(() => store.state.challenges);
const categories = computed(() => store.state.categories);

const pointTotal = computed(() => {
  return user.value?.solvedChallenges
    .map((solvedChallenge) => {
      return challenges.value.find((challenge) => challenge.id === solvedChallenge.challengeId)?.points ?? 0;
    })
    .reduce((value, total) => total + value, 0);
});
</script>
