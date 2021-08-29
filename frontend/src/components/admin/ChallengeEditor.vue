<template>
  <h2>Challenges</h2>
  <table class="table align-middle">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Category</th>
        <th>Solves</th>
        <th>
          <button
            class="btn btn-success w-100"
            @click="editChallenge = { ...challengeTemplate }"
            data-bs-toggle="modal"
            data-bs-target="#challengeModal"
          >
            Create Challenge
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="challenge in challenges" :key="challenge.id">
        <td>{{ challenge.id }}</td>
        <td>{{ challenge.title }}</td>
        <td>{{ challenge.category }}</td>
        <td>{{ challenge.solves.length }}</td>
        <td>
          <div class="d-flex">
            <button
              class="btn btn-primary btn-flex"
              @click="editChallenge = { ...challenge }"
              data-bs-toggle="modal"
              data-bs-target="#challengeModal"
            >
              Edit</button
            >&nbsp;
            <button class="btn btn-danger btn-flex" @click="deleteChallenge(challenge)">Delete</button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
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
              <label class="form-label">Challenge Author</label>
              <input type="text" class="form-control" name="author" v-model="editChallenge.author" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Challenge Description Preview:</label>
              <div v-html="descriptionText" style="white-space: pre-line"></div>
            </div>
            <div class="mb-3">
              <label class="form-label">Flag Type</label>
              <select class="form-control" name="flagType" v-model="editChallenge.flagType" required>
                <option value="string">String (WMG{AAAA})</option>
                <option value="location">Location (Lat, Long)</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Flag</label>
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
              <label class="form-label">Hint (supports Markdown)</label>
              <input type="text" class="form-control" name="hint" v-model="editChallenge.hint" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Challenge Description Preview:</label>
              <div v-html="hintText" style="white-space: pre-line"></div>
            </div>
            <div class="mb-3">
              <label class="form-label">Tags (comma seperated)</label>
              <input type="text" class="form-control" name="tags" v-model="editChallenge.tags" />
            </div>
            <div class="mb-3">
              <label class="form-label">Education Links (comma seperated)</label>
              <input type="text" class="form-control" name="educationResources" v-model="editChallenge.educationResources" />
            </div>
            <div class="mb-3">
              <label class="form-label">Unlock Requirement</label>
              <select class="form-control" name="unlockRequirement" v-model="editChallenge.unlockRequirement">
                <option :value="undefined" selected>None</option>
                <option v-for="challenge in challenges" :value="challenge.id">{{ challenge.category }} - {{ challenge.title }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Challenge URL</label>
              <input type="text" class="form-control" name="url" v-model="editChallenge.url" />
            </div>
            <div class="mb-3">
              <label class="form-label">Challenge File (Current File: {{ editChallenge.fileName || "N/A" }})</label>
              <input class="form-control" type="file" name="file" />
            </div>
          </div>
          <div class="modal-footer">
            <div v-if="editChallenge.id !== -1" class="me-auto">
              <button class="btn btn-danger" @click="deleteChallengeSolves(editChallenge)">Delete Submissions</button>
            </div>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="submit" class="btn btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import config from "../../config";
import marked from "marked";
import API from "../../utils/api";
import { computed, onMounted, ref } from "vue";
import type { AdminChallenge } from "../../types/Challenge";

const challenges = ref<AdminChallenge[]>([]);

onMounted(async () => {
  const response = await API.getAdminChallenges();

  if (response) challenges.value = response.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
});

const challengeTemplate: AdminChallenge = {
  locked: false,
  id: -1,
  title: "",
  description: "",
  author: "",
  flagType: "string",
  flag: "",
  points: 10,
  tags: [],
  category: "",
  hint: "",
  disabled: false,
  educationResources: [],
  difficulty: "Easy",
  url: "",
  solves: [],
};

const editChallenge = ref<AdminChallenge>(challengeTemplate);

const descriptionText = computed(() => {
  return marked.parseInline(editChallenge.value.description);
});

const hintText = computed(() => {
  return marked.parseInline(editChallenge.value.hint);
});
const deleteChallengeSolves = async ({ id, title }: AdminChallenge) => {
  if (confirm(`Are you sure you want to delete ${title}'s solves?`)) {
    const response = await API.deleteChallengeSolves(id);
  }
};

const deleteChallenge = async ({ id, title }: AdminChallenge) => {
  if (confirm(`Are you sure you want to delete ${title}?`)) {
    const response = await API.deleteChallenge(id);

    if (response) challenges.value = challenges.value.filter((challenge) => challenge.id !== id);
  }
};
</script>

<style scoped>
.btn-flex {
  flex: 1;
}
</style>
