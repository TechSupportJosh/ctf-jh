<template>
  <div class="container">
    <div class="row">
      <div class="col-8">
        <h1>Intake CTF Admin</h1>
      </div>
    </div>
    <hr />
    <div class="alert alert-danger" v-if="errorMessage"><strong>An error occured: </strong>{{ errorMessage }}</div>
    <div class="alert alert-success" v-if="successMessage"><strong>Success: </strong>{{ successMessage }}</div>
    <router-view> </router-view>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import config from "../config";

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
</script>
