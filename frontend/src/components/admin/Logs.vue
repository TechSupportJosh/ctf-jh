<template>
  <h2>Logs</h2>
  <table class="table align-middle" style="font-size: 1em">
    <thead>
      <tr>
        <th>ID</th>
        <th>Created At</th>
        <th>Event</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in logs" :key="entry.id">
        <td>{{ entry.id }}</td>
        <td>{{ new Date(entry.createdAt).toLocaleString() }}</td>
        <td>{{ entry.eventType }}</td>
        <td>
          <div v-for="(value, key) in entry.data">
            <strong>{{ removePrefix(key) }}</strong
            >: <span v-html="dataToString(key, value)"></span>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import type { Challenge } from "../../types/Challenge";
import type { Log } from "../../types/Log";
import type { Team } from "../../types/Team";
import type { User } from "../../types/User";
import API from "../../utils/api";

const logs = ref<Log[]>([]);
const users = ref<User[]>([]);
const challenges = ref<Challenge[]>([]);
const teams = ref<Team[]>([]);

const currentPage = ref(0);
const resultLimit = ref(20);

onMounted(async () => {
  const logsResponse = await API.getAdminLogs(currentPage.value, resultLimit.value);
  if (logsResponse) logs.value = logsResponse.data;

  const userResponse = await API.getAdminUsers();
  if (userResponse) users.value = userResponse;

  const challengeResponse = await API.getAdminChallenges();
  if (challengeResponse) challenges.value = challengeResponse;

  const teamsResponse = await API.getAdminTeams();
  if (teamsResponse) teams.value = teamsResponse;
});

const removePrefix = (key: string) => {
  if (key.indexOf(":") === -1) return key;
  const [_, ...values] = key.split(":");
  return values.join(":");
};

const dataToString = (key: string, value: any) => {
  if (key.startsWith("user:")) {
    const user = users.value.find((user) => user.id === value);
    return user ? `${user.firstName} ${user.lastName} (User ID ${user.id})` : `<span class="text-danger">(Deleted)</span>`;
  } else if (key.startsWith("challenge:")) {
    const challenge = challenges.value.find((challenge) => challenge.id === value);
    return challenge
      ? `${challenge.title} (${challenge.category} - ${challenge.difficulty})`
      : `${value} <span class="text-danger">(Deleted)</span>`;
  } else if (key.startsWith("team:")) {
    const team = teams.value.find((teams) => teams.id === value);
    return team
      ? `${team.name} (Team Leader - ${team.teamLeader.firstName} ${team.teamLeader.lastName})`
      : `${value} <span class="text-danger">(Deleted)</span>`;
  }

  return value.toString();
};
</script>
