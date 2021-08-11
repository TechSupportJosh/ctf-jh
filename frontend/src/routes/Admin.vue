<template>
  <div class="container">
    <div class="row">
      <div class="col-8">
        <h1>Intake CTF Admin</h1>
      </div>
      <div class="col-4 d-flex align-items-center justify-content-end">
        <div>
          <router-link to="/">Home</router-link>&nbsp;&nbsp;
          <a :href="`${basePath}api/auth/logout`">Log Out</a>
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
            <h5 class="card-text">{{ stats?.totalSolves }}</h5>
            <p class="card-text text-muted">Flags Submitted</p>
          </div>
        </div>
      </div>
    </div>
    <hr />
    <div class="alert alert-danger" v-if="errorMessage"><strong>An error occured: </strong>{{ errorMessage }}</div>
    <div class="alert alert-success" v-if="successMessage"><strong>Success: </strong>{{ successMessage }}</div>

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
import {basePath} from "shared/config";
import API from "../utils/api";
import type { AdminStats } from "../types/Stats";
import { useRoute } from "vue-router";

const stats = ref<AdminStats>();

const route = useRoute();
const errorCode = route.query.error;
const errorMessage = ref("");
const successCode = route.query.success;
const successMessage = ref("");

switch (errorCode) {
  case "no-password":
    errorMessage.value = "A password must be specified for this user.";
    break;
  case "username-exists":
    errorMessage.value = "This username already exists.";
    break;
  case "hash-error":
    errorMessage.value = "Failed to hash password, please consult the console.";
    break;
}

switch (successCode) {
  case "challenge-updated":
    successMessage.value = "The challenge has been successfully updated.";
    break;
  case "user-updated":
    successMessage.value = "The user has been successfully updated.";
    break;
}

onMounted(async () => {
  const statsResponse = await API.getAdminStats();

  if (statsResponse) stats.value = statsResponse;
});
</script>
