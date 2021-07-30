<template>
  <div class="row">
    <div class="col-12">
      <h3>Team Dashboard {{ user.team ? ` - ${user.team.name}` : "" }}</h3>
    </div>
  </div>
  <hr />
  <div v-if="user.team">
    <template v-if="!team">Loading...</template>
    <template v-else>
      <h4 class="mb-3">Members</h4>
      <div
        v-for="member in team.members"
        class="team-member"
        :class="member.id === team.teamLeader.id ? 'border-warning' : 'border-primary'"
      >
        <strong>{{ member.name }}</strong
        ><br />
        <div class="text-muted">{{ member.points }} Points - {{ member.bloods }} Bloods</div>
      </div>
      <hr />
      <h4 class="mb-3">Stats</h4>
      <stats-graph :stats="team.stats"></stats-graph>
      <hr />
      <template v-if="user.id !== team.teamLeader.id">
        <div class="alert alert-danger" v-if="leaveTeamError"><strong>An error occured: </strong>{{ leaveTeamError }}</div>
        <button class="btn btn-danger" @click="leaveTeam">Leave Team</button>
      </template>
      <template v-else>
        <router-link class="btn btn-primary" to="/team/settings">View Team Settings</router-link>
      </template></template
    >
  </div>
  <div v-else>
    <p>
      You are not currently a member of a team. You can create one yourself or join another one. To join another team, you must ask the team
      leader to provide you with their team invite code.
    </p>

    <div class="row mb-4">
      <div class="col-6">
        <button class="btn btn-success w-100" @click="currentForm = 'createTeam'">Create Team</button>
      </div>
      <div class="col-6">
        <button class="btn btn-primary w-100" @click="currentForm = 'joinTeam'">Join Team</button>
      </div>
    </div>

    <hr />
    <join-team v-if="currentForm === 'joinTeam'"> </join-team>
    <create-team v-if="currentForm === 'createTeam'"></create-team>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import store from "../plugins/store";
import JoinTeam from "../components/JoinTeam.vue";
import CreateTeam from "../components/CreateTeam.vue";
import API from "../utils/api";
import type { Team } from "../types/Team";
import StatsGraph from "../components/StatsGraph.vue";

const user = computed(() => store.state.user!);
const team = ref<Team>();

const currentForm = ref<"joinTeam" | "createTeam">();
const leaveTeamError = ref("");

watch(
  () => user.value,
  async (user) => {
    if (!user.team) return;

    const response = await API.getTeam(user.team?.id);

    if (response) team.value = response;
  },
  { immediate: true }
);

const leaveTeam = async () => {
  if (!confirm(`Are you sure you want to leave ${user.value.team?.name}?`)) return;

  const response = await API.leaveTeam();

  if (response.statusCode === 200) {
    await store.dispatch("loadUser");
  } else {
    leaveTeamError.value = response.message;
  }
};
</script>

<style scoped>
.team-member {
  padding-left: 1rem;
  border-left: 10px solid;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}
</style>
