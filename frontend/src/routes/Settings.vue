<template>
  <div class="row">
    <div class="col-12">
      <h3>Settings</h3>
    </div>
  </div>
  <hr />
  <h4>Logged-in Sessions</h4>
  <table class="table align-middle" style="font-size: 1em">
    <thead>
      <tr>
        <th scope="col">Logged in at</th>
        <th>IP Address</th>
        <th>Device</th>
        <th><button class="btn btn-danger w-100 btn-sm" @click="confirmLogout()">Log Out All Sessions</button></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="session in sessions">
        <th scope="row">{{ new Date(session.creationDate).toLocaleString() }}</th>
        <td>{{ session.ipAddress }}</td>
        <td>{{ readableUA(session.userAgent) }}</td>
        <td><button class="btn btn-danger w-100 btn-sm" @click="confirmLogout(session.authId)">Log Out</button></td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Session } from "../types/User";
import API from "../utils/api";
import UAParser from "ua-parser-js";
import { useRouter } from "../plugins/router";
import store from "../plugins/store";

const sessions = ref<Session[]>([]);
const router = useRouter();

const readableUA = (userAgent: string) => {
  const parsed = new UAParser(userAgent);
  const browser = parsed.getBrowser();
  const operatingSystem = parsed.getOS();
  return `${browser.name ?? "Unknown Browser"} ${browser.version} on ${operatingSystem.name ?? "Unknown Operating System"} ${
    operatingSystem.version
  }`;
};

onMounted(async () => {
  const response = await API.getSessions();

  if (response) sessions.value = response;
});

const confirmLogout = async (sessionId?: number) => {
  const confirmMessage = sessionId ? "Are you sure you want to log out this session?" : "Are you sure you want to log out ALL sessions?";

  if (!confirm(confirmMessage)) return;

  const response = sessionId ? await API.deleteSession(sessionId) : await API.deleteSessions();

  if (response) {
    // Check whether the user deleted their own session
    await store.dispatch("loadUser");
    if (!store.state.user) {
      router.push("/login?success=logged-out");
    }
  }
};
</script>
