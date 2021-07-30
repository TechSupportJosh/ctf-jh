<template>
  <div class="row">
    <div class="col-12">
      <h3>Your Profile</h3>
    </div>
  </div>
  <hr />
  <h4>Stats</h4>
  <stats-graph :stats="stats" v-if="stats"></stats-graph>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import store from "../plugins/store";
import API from "../utils/api";
import StatsGraph from "../components/StatsGraph.vue";
import type { SolveStats } from "../types/Stats";

const user = computed(() => store.state.user!);
const stats = ref<SolveStats[]>();

onMounted(async () => {
  const response = await API.getStats();

  if (response) stats.value = response;
});
</script>
