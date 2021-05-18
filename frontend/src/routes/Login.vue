<template>
  <div class="vh-100 d-flex justify-content-center align-items-center text-center">
    <div class="login-container">
      <h1>Intake CTF</h1>
      <h4 class="mb-4">Hosted by WMG Cyber Society</h4>
      <div class="alert alert-danger" v-if="errorMessage"><strong>An error occured: </strong>{{ errorMessage }}</div>
      <a :href="`${config.basePath}api/auth`" class="btn login-button text-white px-4">Login With Warwick ID</a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import config from "../config";

const route = useRoute();
const errorCode = route.query.error;
const errorMessage = ref("");

switch (errorCode) {
  case "oauth":
    errorMessage.value = "Failed to fetch OAuth status, please try again";
    break;
  case "course-id":
    errorMessage.value = "You do not have access to this site, please contact an administrator";
    break;
}
</script>

<style scoped>
.login-button {
  background-color: #5b3069;
}
.login-container {
  background-color: white;
  padding: 50px;
  border-radius: 10px;
}
</style>
