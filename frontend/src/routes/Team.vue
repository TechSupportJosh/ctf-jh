<template>
  <div class="row">
    <div class="col-12">
      <h3>{{ isSelf ? "Your" : "Viewing" }} Team</h3>
    </div>
  </div>
  <div v-if="user.team || !isSelf">
    <template v-if="!team">Loading...</template>
    <template v-else>
      <hr />
      <h3 class="text-center">
        <strong>{{ team.name }}</strong>
      </h3>
      <h3 class="text-center">{{ pointTotal }} Points</h3>
      <h5 class="text-center">
        {{ solvedChallenges.length }} Solves - {{ solvedChallenges.filter((solvedChallenge) => solvedChallenge.isBlood).length }} Bloods
      </h5>
      <hr />
      <div class="row">
        <div class="col-9">
          <h4 class="mb-3">Members ({{ team.members.length }} / {{ store.state.config.maxTeamSize }})</h4>
        </div>
        <div class="col-3" v-if="user.id === team.teamLeader.id">
          <router-link class="btn btn-primary w-100" to="/team/settings">View Team Settings</router-link>
        </div>
      </div>
      <div
        v-for="member in team.members"
        class="team-member"
        :class="member.id === team.teamLeader.id ? 'border-warning' : 'border-primary'"
      >
        <a :href="`/profile/${member.id}`" class="text-white"
          ><strong>{{ member.firstName }} {{ member.lastName }}</strong></a
        ><br />
        <div class="text-muted">{{ member.stats?.points }} Points - {{ member.stats?.bloods }} Bloods</div>
      </div>
      <hr />
      <template v-if="hasCTFStarted">
        <h4 class="text-center">Stats</h4>
        <stats-graph :stats="team.stats" class="mb-4"></stats-graph>
        <h4 class="text-center">Attempts</h4>
        <solve-attempts-graph :solve-attempts="solveAttempts" class="mb-4"></solve-attempts-graph>
        <h4 class="text-center">Challenge Breakdown</h4>
        <category-breakdown-graph :solved-challenges="solvedChallenges" class="mb-4"></category-breakdown-graph>
        <h4 class="text-center">Team Breakdown</h4>
        <team-breakdown-graph :team-members="team.members" class="mb-4"></team-breakdown-graph>
        <h4 class="text-center">Challenges Solved</h4>
        <table class="table" style="font-size: 1em">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th>Member</th>
              <th>Challenge</th>
              <th>Category</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="solve in solvedChallenges">
              <th scope="row">{{ new Date(solve.solveDate).toLocaleString() }}</th>
              <td>
                {{ team.members.find((user) => user.id === solve.userId)?.firstName }}&nbsp;
                {{ team.members.find((user) => user.id === solve.userId)?.lastName }}
              </td>
              <td>{{ challenges.find((challenge) => challenge.id === solve.challengeId)?.title }}</td>
              <td>{{ challenges.find((challenge) => challenge.id === solve.challengeId)?.category }}</td>
              <td>{{ challenges.find((challenge) => challenge.id === solve.challengeId)?.points }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-else>
        <p class="text-muted text-center">Your team's stats will appear once the CTF has started.</p>
      </template>
      <template v-if="user.id !== team.teamLeader.id && !hasCTFStarted && isSelf">
        <hr />
        <h4 class="text-center">Leave Team</h4>
        <div class="alert alert-danger" v-if="leaveTeamError"><strong>An error occured: </strong>{{ leaveTeamError }}</div>
        <p class="text-center">If you leave this team, the team leader must send you a new invite code if you wish to rejoin the team.</p>
        <div class="row">
          <div class="col-4 offset-4">
            <button class="btn btn-danger w-100" @click="leaveTeam">Leave Team</button>
          </div>
        </div>
      </template>
    </template>
  </div>
  <div v-else>
    <template v-if="!hasCTFStarted">
      <p>
        You are not currently a member of a team. You can create one yourself or join another one. To join another team, you must ask the
        team leader to provide you with their team invite code.
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
    </template>
    <template v-else>
      <p>You are not a member of a team. As the CTF has started, you are unable to create or join a new team.</p>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import CreateTeam from "../components/CreateTeam.vue";
import CategoryBreakdownGraph from "../components/graphs/CategoryBreakdownGraph.vue";
import TeamBreakdownGraph from "../components/graphs/TeamBreakdownGraph.vue";
import SolveAttemptsGraph from "../components/graphs/SolveAttemptsGraph.vue";
import StatsGraph from "../components/graphs/StatsGraph.vue";
import JoinTeam from "../components/JoinTeam.vue";
import store from "../plugins/store";
import type { UserChallengeSolve } from "../types/Challenge";
import type { AttemptStats } from "../types/Stats";
import API from "../utils/api";
import { hasCTFStarted } from "../utils/status";
import type { Team } from "../types/Team";
import { useRoute } from "vue-router";

const user = computed(() => store.state.user!);
const challenges = computed(() => store.state.challenges);
const team = ref<Team>();

const currentForm = ref<"joinTeam" | "createTeam">();
const leaveTeamError = ref("");

const solveAttempts = ref<AttemptStats>({
  correct: 0,
  incorrect: 0,
});
const solvedChallenges = ref<UserChallengeSolve[]>([]);

const isSelf = ref(false);

onMounted(async () => {
  const route = useRoute();
  if (route.params["teamId"]) {
    const teamId = parseInt(route.params["teamId"].toString());
    if (!isNaN(teamId) && teamId !== store.state.team?.id) {
      const response = await API.getTeam(teamId);
      if (response) team.value = response;
    }
  }

  if (!team.value) {
    team.value = store.state.team;
    isSelf.value = true;
  }
});

// As team is not a computedRef here, we have to watch for it
watch(
  () => store.state.team,
  () => {
    // if we're not viewing our own team, we don't need to update the team ref
    if (!isSelf) return;

    team.value = store.state.team;
  }
);

watch(
  team,
  () => {
    team.value?.members.forEach((member) => {
      solveAttempts.value.correct += member.solveAttempts?.correct ?? 0;
      solveAttempts.value.incorrect += member.solveAttempts?.incorrect ?? 0;

      solvedChallenges.value.push(...(member.solvedChallenges ?? []));
    });

    solvedChallenges.value.sort((a, b) => new Date(b.solveDate).valueOf() - new Date(a.solveDate).valueOf());
  },
  { immediate: true }
);

const leaveTeam = async () => {
  if (!confirm(`Are you sure you want to leave ${user.value.team?.name}?`)) return;

  const response = await API.leaveTeam();

  if (response.statusCode === 200) {
    await store.dispatch("loadUser");
    await store.dispatch("loadTeam");
  } else {
    leaveTeamError.value = response.message;
  }
};

const pointTotal = computed(() => {
  return solvedChallenges.value
    .map((solvedChallenge) => {
      return challenges.value.find((challenge) => challenge.id === solvedChallenge.challengeId)?.points ?? 0;
    })
    .reduce((value, total) => total + value, 0);
});
</script>

<style scoped>
.team-member {
  padding-left: 1rem;
  border-left: 10px solid;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}
</style>
