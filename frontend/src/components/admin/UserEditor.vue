<template>
  <h2>Users</h2>
  <table class="table align-middle">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Username</th>
        <th>Warwick ID</th>
        <th>Is Admin</th>
        <th>Solves</th>
        <th>
          <button class="btn btn-success w-100" @click="editUser = { ...userTemplate }" data-bs-toggle="modal" data-bs-target="#userModal">
            Create User
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in users" :key="user.id">
        <td>{{ user.id }}</td>
        <td>{{ user.firstName }} {{ user.lastName }}</td>
        <td>{{ user.username ?? "N/A" }}</td>
        <td>{{ user.warwickId ?? "N/A" }}</td>
        <td>{{ user.isAdmin ? "Yes" : "No" }}</td>
        <td>{{ user.solvedChallenges.length }}</td>
        <td>
          <div class="d-flex justify-content-between">
            <button class="btn btn-light" @click="editUser = { ...user, password: '' }" data-bs-toggle="modal" data-bs-target="#userModal">
              ✏️
            </button>
            <button class="btn btn-light" @click="deleteUserSubmissions(user)">🗑️</button>
            <button class="btn btn-light" @click="deleteUser(user)">❌</button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="modal" id="userModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <form :action="`${config.basePath}api/admin/users`" method="POST">
          <div class="modal-header">
            <h5 class="modal-title">Creating or Editing User</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3" v-show="editUser.id !== -1">
              <label class="form-label">User ID</label>
              <input type="text" readonly class="form-control" name="id" v-model="editUser.id" />
            </div>
            <div class="mb-3">
              <label class="form-label">First Name</label>
              <input type="text" class="form-control" name="firstName" v-model="editUser.firstName" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Last Name</label>
              <input type="text" class="form-control" name="lastName" v-model="editUser.lastName" required />
            </div>
            <div class="mb-3 form-check">
              <input class="form-check-input" type="checkbox" name="isAdmin" v-model="editUser.isAdmin" />
              <label class="form-check-label"> Is Admin </label>
            </div>
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input type="text" class="form-control" name="username" autocomplete="off" v-model="editUser.username" />
            </div>
            <label class="form-label">Password</label>
            <div class="mb-3 input-group">
              <input type="text" class="form-control" name="password" autocomplete="off" v-model="editUser.password" />
              <button class="btn btn-primary" type="button" @click="generatePassword">Generate Password</button>
            </div>
            <div class="mb-3">
              <label class="form-label">Warwick ID</label>
              <input type="number" class="form-control" name="warwickId" v-model="editUser.warwickId" />
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
import config from "../../config";
import API from "../../utils/api";
import { onMounted, ref } from "vue";
import type { User } from "../../types/User";

const users = ref<User[]>([]);

interface EditUser extends User {
  password: string;
}
const userTemplate: EditUser = {
  id: -1,
  warwickId: undefined,
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  isAdmin: false,
  solvedChallenges: [],
};

const editUser = ref<EditUser>(userTemplate);

onMounted(async () => {
  const response = await API.getAdminUsers();

  if (response) users.value = response;
});

const generatePassword = () => {
  let password = "";
  for (let i = 0; i < 20; i++) {
    password += (window.crypto.getRandomValues(new Uint8Array(1))[0] & 15).toString(16);
  }

  editUser.value.password = password;
};

const deleteUserSubmissions = async ({ id, firstName, lastName }: User) => {
  if (confirm(`Are you sure you want to delete ${firstName} ${lastName}'s submissions?`)) {
    const response = await API.deleteUserSubmissions(id);
  }
};

const deleteUser = async ({ id, firstName, lastName }: User) => {
  if (confirm(`Are you sure you want to delete ${firstName} ${lastName}?`)) {
    const response = await API.deleteUser(id);

    if (response) users.value = users.value.filter((user) => user.id !== id);
  }
};
</script>
