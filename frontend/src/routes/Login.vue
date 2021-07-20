<template>
  <div class="vh-100">
    <div id="main-container" class="vh-100">
      <div id="login-container">
        <h1>Intake CTF</h1>
        <h4 class="mb-4">Hosted by WMG Cyber Society</h4>
        <div class="alert alert-danger" v-if="errorMessage"><strong>An error occured: </strong>{{ errorMessage }}</div>
        <a :href="`${config.basePath}api/auth/login`" class="btn text-white px-4" id="login-button">Login With Warwick ID</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import config from "../config";
import { tsParticles } from "tsparticles";
import particlesConfig from "../assets/particles.json";

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

onMounted(() => {
  tsParticles.load("main-container", particlesConfig as any);
});
</script>

<style scoped lang="scss">
#login-button {
  background-color: #5b3069;
}
#main-container {
  display: flex;
  vertical-align: bottom;
  min-height: 100vh;
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
}
#login-container {
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0 auto;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  padding: 40px;
  border-radius: 10px;
  background-color: var(--bs-dark);
}
</style>
