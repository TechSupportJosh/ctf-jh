<template>
  <div class="vh-100">
    <div id="main-container" class="vh-100">
      <div id="login-container">
        <h1>Intake CTF</h1>
        <h4 class="mb-4">Hosted by WMG Cyber Society</h4>
        <div class="alert alert-danger" v-if="errorMessage"><strong>An error occured: </strong>{{ errorMessage }}</div>
        <div v-show="!showUsernameLogin">
          <div class="mb-2">
            <a :href="`${config.basePath}api/auth/warwick`" class="btn text-white w-100" id="login-button">Login With Warwick ID</a>
          </div>
          <div>
            <button class="btn btn-secondary text-white w-100" @click="showUsernameLogin = true">Login With Username</button>
          </div>
        </div>
        <div v-show="showUsernameLogin" class="text-left">
          <form :action="`${config.basePath}api/auth/login`" method="POST">
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-valid': isUsernameValid, 'is-invalid': !isUsernameValid }"
                name="username"
                v-model="username"
              />
              <div class="invalid-feedback" v-if="!isUsernameValid">Usernames must be between 1 and 64 characters.</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input
                type="password"
                class="form-control"
                name="password"
                :class="{ 'is-valid': isPasswordValid, 'is-invalid': !isPasswordValid }"
                v-model="password"
              />
              <div class="invalid-feedback" v-if="!isPasswordValid">Passwords must be between 8 and 256 characters.</div>
            </div>
            <button
              type="submit"
              class="btn btn-success text-white w-100 mb-1"
              :class="{ disabled: !(isUsernameValid && isPasswordValid) }"
            >
              Login
            </button>
            <a href="#" @click.prevent="showUsernameLogin = false">Go Back</a>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import config from "../config";
import { tsParticles } from "tsparticles";
import particlesConfig from "../assets/particles.json";

const route = useRoute();
const errorCode = route.query.error;
const errorMessage = ref("");

const showUsernameLogin = ref(false);

const username = ref("");
const password = ref("");

const isUsernameValid = computed(() => {
  return username.value.length > 0 && username.value.length <= 64;
});

const isPasswordValid = computed(() => {
  return password.value.length >= 8 && password.value.length <= 256;
});

switch (errorCode) {
  case "oauth":
    errorMessage.value = "Failed to fetch OAuth status, please try again";
    break;
  case "no-access":
    errorMessage.value = "You do not have access to this site, please contact an administrator";
    break;
  case "requires-auth":
    errorMessage.value = "This page requires authentication.";
    break;
  case "invalid-creds":
    errorMessage.value = "An invalid username or password was entered.";
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
  position: absolute;
  left: 0;
  right: 0;
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
  width: 500px;
}
</style>
