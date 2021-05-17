<template>
  <div class="container">
    <div class="accordion accordion-flush" id="challenge-accordion">
      <div class="accordion-item" v-for="challenge in challenges" :key="challenge.id">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#challenge-${challenge.id}`">
            {{ challenge.title }} - {{ challenge.points }} points
          </button>
        </h2>
        <div :id="`challenge-${challenge.id}`" class="accordion-collapse collapse" data-bs-parent="#challenge-accordion">
          <div class="accordion-body">
            {{ challenge.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import type { Challenge } from "./types/Challenge";
import API from "./utils/api";

const challenges = ref<Challenge[]>();

onMounted(async () => {
  challenges.value = await API.getChallenges();
});
</script>
