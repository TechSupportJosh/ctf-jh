<template>
  <div class="collapse navbar-collapse" id="navbar">
    <ul class="navbar-nav navbar-nav-scroll nav-pills sflex-column mb-auto">
      <li class="nav-item"><router-link to="/admin" class="nav-link" exact-active-class="active">Home</router-link></li>
      <li class="nav-item"><router-link to="/admin/users" class="nav-link" active-class="active">Users</router-link></li>
      <li class="nav-item"><router-link to="/admin/challenges" class="nav-link" active-class="active">Challenges</router-link></li>
      <hr />
      <div class="w-100 text-center">
        <strong>{{ user?.firstName }} {{ user?.lastName }}</strong
        ><br />
        <a :href="`${config.basePath}api/auth/logout`" class="text-white">Log Out</a>
      </div>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import store from "../plugins/store";
import config from "../config";

const user = computed(() => store.state.user);
</script>
