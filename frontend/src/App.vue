<template>
  <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { RouterView } from "vue-router";

export default defineComponent({
  components: {
    RouterView,
  },
});
</script>

<style>
body {
  background: #9d50bb; /* fallback for old browsers */
  background: -webkit-linear-gradient(to bottom, #6e48aa, #9d50bb); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to bottom, #6e48aa, #9d50bb); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  overflow-y: scroll;
}
#app {
  min-height: 100vh;
}
.container {
  background-color: white;
  padding: 3rem 6rem;
}
</style>
