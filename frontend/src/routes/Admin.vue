<template>
  <div class="container">
    <div class="row">
      <div class="col-8">
        <h1>Intake CTF Admin</h1>
      </div>
      <div class="col-4 d-flex align-items-center justify-content-end">
        <div>
          <router-link to="/">Home</router-link>&nbsp;&nbsp;
          <a :href="`${config.basePath}api/auth/logout`">Log Out</a>
        </div>
      </div>
    </div>

    <button
      class="btn btn-success"
      @click="editChallenge = { ...challengeTemplate }"
      data-bs-toggle="modal"
      data-bs-target="#challengeModal"
    >
      Create Challenge
    </button>
    <table class="table align-middle">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Category</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="challenge in challenges" :key="challenge.id">
          <td>{{ challenge.id }}</td>
          <td>{{ challenge.title }}</td>
          <td>{{ challenge.category }}</td>
          <td>
            <button
              class="btn btn-primary w-100"
              @click="editChallenge = { ...challenge }"
              data-bs-toggle="modal"
              data-bs-target="#challengeModal"
            >
              Edit
            </button>
          </td>
          <td>
            <button class="btn btn-danger w-100">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="modal" id="challengeModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <form :action="`${config.basePath}api/admin/challenges`" method="POST" enctype="multipart/form-data">
          <div class="modal-header">
            <h5 class="modal-title">Creating or Editing Challenge</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3" v-show="editChallenge.id !== -1">
              <label class="form-label">Challenge ID</label>
              <input type="text" readonly class="form-control" name="id" v-model="editChallenge.id" />
            </div>
            <div class="mb-3 form-check">
              <input class="form-check-input" type="checkbox" name="disabled" v-model="editChallenge.disabled" />
              <label class="form-check-label"> Disabled </label>
            </div>
            <div class="mb-3">
              <label class="form-label">Challenge Title</label>
              <input type="text" class="form-control" name="title" v-model="editChallenge.title" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Challenge Description (supports Markdown)</label>
              <textarea class="form-control" name="description" v-model="editChallenge.description" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Challenge Description Preview:</label>
              <div v-html="descriptionText" style="white-space: pre-line"></div>
            </div>
            <div class="mb-3">
              <label class="form-label">Flag (include WMG{})</label>
              <textarea class="form-control" name="flag" v-model="editChallenge.flag" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Category</label>
              <input type="text" class="form-control" name="category" v-model="editChallenge.category" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Points</label>
              <input type="number" class="form-control" name="points" v-model="editChallenge.points" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Difficulty</label>
              <select class="form-control" name="difficulty" v-model="editChallenge.difficulty" required>
                <option value="Very Easy">Very Easy</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Very Hard">Very Hard</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Hint</label>
              <input type="text" class="form-control" name="hint" v-model="editChallenge.hint" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Tags (comma seperated)</label>
              <input type="text" class="form-control" name="tags" v-model="editChallenge.tags" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Education Links (comma seperated)</label>
              <input type="text" class="form-control" name="education_links" v-model="editChallenge.education_links" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Challenge URL</label>
              <input type="text" class="form-control" name="challenge_url" v-model="editChallenge.challenge_url" />
            </div>
            <div class="mb-3">
              <label class="form-label">Challenge File (Current File: {{ editChallenge.file_name || "N/A" }})</label>
              <input class="form-control" type="file" name="challenge_file" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="submit" class="btn btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from "vue";
import type { AdminChallenge } from "../types/Challenge";
import API from "../utils/api";
import config from "../config";
import marked from "marked";

const challenges = ref<AdminChallenge[]>();
const challengeTemplate = {
  id: -1,
  title: "",
  description: "",
  flag: "",
  points: 10,
  tags: [],
  category: "",
  hint: "",
  disabled: false,
  education_links: [],
  difficulty: "Easy",
  challenge_url: "",
};

const editChallenge = ref<AdminChallenge>(challengeTemplate);

onMounted(async () => {
  challenges.value = await API.getAdminChallenges();
});

const descriptionText = computed(() => {
  return marked.parseInline(editChallenge.value.description);
});
</script>
