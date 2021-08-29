<template>
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
</template>

<script lang="ts" setup>
import API from "../../utils/api";
import { onMounted, ref } from "vue";
import type { AdminStats } from "../../types/Stats";

const stats = ref<AdminStats>();

onMounted(async () => {
  const statsResponse = await API.getAdminStats();

  if (statsResponse) stats.value = statsResponse;
});
</script>
