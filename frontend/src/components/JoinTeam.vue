<template>
  <h4 class="mb-3">Join Team</h4>
  <div class="input-group mb-3 has-validation">
    <input type="text" class="form-control" placeholder="Invite code" v-model="inviteCode" />
    <button
      class="btn btn-primary"
      :class="validationError ? 'is-invalid' : ''"
      type="button"
      @click="joinTeam"
      :disabled="!inviteCode.length"
    >
      Join Team
    </button>
    <div class="invalid-feedback">{{ validationError }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import store from "../plugins/store";
import API from "../utils/api";

const validationError = ref("");
const inviteCode = ref("");

const joinTeam = async () => {
  const response = await API.joinTeam(inviteCode.value);

  if (response.statusCode === 200) {
    await store.dispatch("loadUser");
    await store.dispatch("loadTeam");
  } else {
    validationError.value = response.message;
  }
};
</script>
