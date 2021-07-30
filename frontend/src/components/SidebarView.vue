<template>
  <main>
    <div class="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" id="sidebar">
      <div class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white flex-column">
        <span class="fs-4">Intake CTF</span>
        <router-link v-if="user?.isAdmin" to="/admin">Admin Panel</router-link>
      </div>
      <hr />
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item text-center">{{ pointTotal }} Points<br />{{ user?.solvedChallenges.length ?? 0 }} Challenges Solved</li>
        <hr />
        <li class="nav-item mb-2"><strong>Categories:</strong></li>
        <li class="nav-item" v-for="(challengeCount, category) in categories">
          <router-link :to="`/challenges/${category}`" class="nav-link" active-class="active" aria-current="page">
            {{ category }} ({{ challengeCount }})
          </router-link>
        </li>
      </ul>
      <ul class="nav nav-pills flex-column">
        <li class="nav-item"><router-link to="/profile" class="nav-link" active-class="active">Profile</router-link></li>
        <li class="nav-item"><router-link to="/feed" class="nav-link" active-class="active">Recent Solves</router-link></li>
        <li class="nav-item"><router-link to="/team" class="nav-link" active-class="active">Team</router-link></li>
        <li class="nav-item"><router-link to="/help" class="nav-link" active-class="active">Help</router-link></li>
      </ul>
      <hr />
      <div>
        <strong>{{ user?.firstName }} {{ user?.lastName }}</strong
        ><br />
        <a :href="`${config.basePath}api/auth/logout`" class="text-white">Log Out</a>
      </div>
    </div>
    <div class="container mt-4" id="main-container">
      <router-view></router-view>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import store from "../plugins/store";
import config from "../config";
import { RouterView } from "vue-router";

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

<style lang="scss" scoped>
#app {
  height: 100vh;
}
main {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}

#sidebar {
  width: 280px;
  position: fixed;
  height: 100vh;
}

#main-container {
  padding-left: 280px;
}
</style>
