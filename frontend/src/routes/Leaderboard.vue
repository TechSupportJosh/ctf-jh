<template>
  <div class="row">
    <div class="col-12">
      <h3>Leaderboard</h3>
    </div>
  </div>
  <hr />
  <div class="row mb-4">
    <div class="col-4 offset-2">
      <button
        class="btn w-100"
        :class="leaderboardSelected === 'users' ? 'btn-primary' : 'btn-secondary'"
        @click="leaderboardSelected = 'users'"
      >
        Users
      </button>
    </div>
    <div class="col-4">
      <button
        class="btn w-100"
        :class="leaderboardSelected === 'teams' ? 'btn-primary' : 'btn-secondary'"
        @click="leaderboardSelected = 'teams'"
      >
        Teams
      </button>
    </div>
  </div>
  <div v-if="leaderboardData">
    <p class="text-muted text-center">Last updated {{ timeAgo.format(new Date(leaderboardData.lastUpdated)) }}</p>

    <div style="padding: 1rem" class="bg-dark">
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col" style="width: 50px">#</th>
            <th scope="col">Name</th>
            <th scope="col" class="text-center" style="width: 150px">Solves</th>
            <th scope="col" class="text-center" style="width: 150px">Bloods</th>
            <th scope="col" class="text-center" style="width: 150px">Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, index) in leaderboardData?.leaderboard">
            <th scope="row">{{ index + 1 }}</th>
            <td>
              <a :href="`/${'team' in entry ? 'team' : 'profile'}/${'team' in entry ? entry.team.id : entry.user.id}`">{{
                "team" in entry ? entry.team.name : `${entry.user.firstName} ${entry.user.lastName}`
              }}</a>
            </td>
            <td class="text-center">{{ entry.stats.solves }}</td>
            <td :class="entry.stats.bloods ? 'text-danger fw-bold' : ''" class="text-center">{{ entry.stats.bloods }}</td>
            <td class="text-center">{{ entry.stats.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="text-muted text-center" v-else>Loading...</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import type { TeamLeaderboardStats, UserLeaderboardStats } from "../types/Stats";
import API from "../utils/api";
import timeAgo from "../utils/timeAgo";

const leaderboardSelected = ref<"users" | "teams">("users");
const leaderboardData = ref<UserLeaderboardStats | TeamLeaderboardStats>();
onMounted(() => {});

watch(
  leaderboardSelected,
  async () => {
    leaderboardData.value = undefined;

    const response = await (leaderboardSelected.value === "users" ? API.getUserLeaderboard() : API.getTeamLeaderboard());

    if (response) leaderboardData.value = response;
  },
  { immediate: true }
);
</script>

<style scoped>
.table {
  font-size: 1rem;
}
</style>
