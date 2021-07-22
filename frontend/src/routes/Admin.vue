<template>
  <div class="container">
    <div class="row">
      <div class="col-8">
        <h1>Intake CTF Admin</h1>
      </div>
      <div class="col-4 d-flex align-items-center justify-content-end">
        <div>
          <router-link to="/">Home</router-link>&nbsp;&nbsp;
          <a :href="`${config.basePath}api/auth/logout`">Log Out</a>
        </div>
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col-sm-4 offset-2">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-text">{{ stats?.userCount }}</h5>
            <p class="card-text text-muted">Users Signed Up</p>
          </div>
        </div>
      </div>
      <div class="col-sm-4">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-text">{{ stats?.totalCompletions }}</h5>
            <p class="card-text text-muted">Flags Submitted</p>
          </div>
        </div>
      </div>
    </div>
    <h2>Challenges</h2>
    <challenge-editor></challenge-editor>
    <h2>Users</h2>
    <user-editor></user-editor>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import ChallengeEditor from "../components/ChallengeEditor.vue";
import UserEditor from "../components/UserEditor.vue";
import config from "../config";
import API from "../utils/api";
import type { Stats } from "../types/Stats";

const stats = ref<Stats>();

onMounted(async () => {
  const statsResponse = await API.getAdminStats();

  if (statsResponse) stats.value = statsResponse;
});
</script>
