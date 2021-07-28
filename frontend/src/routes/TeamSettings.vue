<template>
  <div class="row">
    <div class="col-12">
      <h3>Team Settings {{ user.team ? ` - ${user.team.name}` : "" }}</h3>
    </div>
  </div>
  <hr />
  <div v-if="team">
    <h4 class="mb-3">Manage Members ({{ team.members.length }} / 5)</h4>
    <div v-for="member in team.members" class="team-member" :class="member.id === team.teamLeader.id ? 'border-warning' : 'border-primary'">
      <strong>{{ member.name }}</strong
      ><br />
      <div class="text-muted">{{ member.points }} Points - {{ member.bloods }} Bloods</div>
    </div>
    <hr />
    <h4 class="mb-3">Manage Team</h4>
    <div>
      <label for="basic-url" class="form-label">Invite Code</label>
      <div class="mb-3 input-group">
        <input
          :type="showInviteCode ? 'text' : 'password'"
          readonly
          class="form-control"
          v-model="inviteCode"
          autocomplete="new-password"
        />
        <button class="btn btn-primary" type="button" @click="showInviteCode = !showInviteCode">
          <img :src="showInviteCode ? showIcon : hideIcon" />
        </button>
        <button class="btn btn-secondary" type="button" @click="createInviteCode"><img :src="refreshIcon" /></button>
        <button class="btn btn-success" type="button" @click="copy(inviteCode)"><img :src="clipboardIcon" /></button>
      </div>
    </div>

    <div class="alert alert-danger" v-if="disbandTeamError"><strong>An error occured: </strong> {{ disbandTeamError }}</div>
    <button class="btn btn-danger w-100" to="/team/settings" @click="deleteTeam">Disband Team</button>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "../plugins/router";
import store from "../plugins/store";
import API from "../utils/api";
import showIcon from "../assets/eye-fill.svg";
import hideIcon from "../assets/eye-slash-fill.svg";
import refreshIcon from "../assets/arrow-repeat.svg";
import clipboardIcon from "../assets/clipboard.svg";
import copy from "copy-to-clipboard";
import type { Team } from "../types/Team";

const user = computed(() => store.state.user!);

const router = useRouter();

const disbandTeamError = ref("");

const showInviteCode = ref(false);
const inviteCode = ref("");
const team = ref<Team>();

onMounted(async () => {
  if (!user.value.team) return router.push("/team");

  const response = await API.getTeam(user.value.team.id);

  if (response) {
    team.value = response;

    if (team.value.teamLeader.id !== user.value.id) return router.push("/team");

    const codeResponse = await API.getInviteCode(user.value.team.id);

    if (codeResponse) inviteCode.value = codeResponse;
  }
});

onMounted(async () => {
  if (!user.value.team) return;
});

const deleteTeam = async () => {
  if (!confirm(`Are you sure you want to disband ${user.value.team?.name}? This action is irreversible.`)) return;

  const response = await API.deleteTeam(store.state.user!.team!.id);

  if (response.statusCode === 200) {
    await store.dispatch("loadUser");
    router.push("/team");
  } else {
    disbandTeamError.value = response.message;
  }
};

const createInviteCode = async () => {
  const response = await API.createInviteCode(store.state.user!.team!.id);

  if (response) inviteCode.value = response;
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
