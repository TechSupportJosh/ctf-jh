<template>
  <h4 class="mb-3">Create Team</h4>
  <div class="alert alert-danger" v-if="submissionError"><strong>An error occured: </strong>{{ submissionError }}</div>
  <div class="mb-3 has-validation">
    <label class="form-label">Team Name</label>
    <input
      type="text"
      class="form-control"
      :class="{
        'is-invalid': dataValidationMessages.name !== '',
      }"
      v-model="teamData.name"
    />
    <div class="invalid-feedback">{{ dataValidationMessages.name }}</div>
  </div>
  <button class="btn btn-primary" type="button" @click="createTeam" :disabled="!allValid">Create Team</button>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from "vue";
import store from "../plugins/store";
import API from "../utils/api";

const submissionError = ref("");

const teamData = reactive({
  name: "",
});

const dataValidationMessages = computed(() => {
  return {
    name: teamData.name.length >= 3 && teamData.name.length <= 32 ? "" : "Team name must be between 3-32 characters.",
  };
});

const allValid = computed(() => {
  return Object.values(dataValidationMessages.value).every((valid) => valid === "");
});

const createTeam = async () => {
  const response = await API.createTeam(teamData.name);

  if (response.statusCode === 200) {
    submissionError.value = "";
    await store.dispatch("loadUser");
  } else {
    submissionError.value = response.message;
  }
};
</script>
