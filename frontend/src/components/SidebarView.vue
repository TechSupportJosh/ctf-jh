<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-dark fixed-left p-3">
    <span class="fs-4 navbar-brand">Intake CTF</span>
    <router-link v-if="user?.isAdmin" to="/admin">Admin Panel</router-link>

    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbar"
      aria-controls="navbar"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <user-navbar v-if="!currentRoute.path.startsWith('/admin')"></user-navbar>
    <admin-navbar v-else></admin-navbar>
  </nav>
  <div class="container p-4">
    <router-view></router-view>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import store from "../plugins/store";

import AdminNavbar from "./AdminNavbar.vue";
import UserNavbar from "./UserNavbar.vue";

const user = computed(() => store.state.user);

const currentRoute = useRoute();
</script>

<style>
@import "../scss/sidebar.scss";
</style>
