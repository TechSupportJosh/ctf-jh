<template>
  <div class="container">
    <h1>Intake CTF</h1>
    <div class="alert alert-danger" v-if="errorMessage"><strong>An error occured: </strong>{{ errorMessage }}</div>
    <a href="/api/auth" class="btn btn-primary">Login With Warwick</a>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const errorCode = route.query.error;
console.log(errorCode);
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
