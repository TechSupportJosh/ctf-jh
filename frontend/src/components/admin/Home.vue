<template>
  <div class="row">
    <div class="col-sm-4 offset-2">
      <div class="card text-center">
        <div class="card-body">
          <h5 class="card-text">{{ stats?.userCount }}</h5>
          <p class="card-text text-muted">Users Signed Up</p>
        </div>
      </div>
    </div>
    <div class="col-sm-4">
      <div class="card text-center">
        <div class="card-body">
          <h5 class="card-text">{{ stats?.totalSolves }}</h5>
          <p class="card-text text-muted">Flags Submitted</p>
        </div>
      </div>
    </div>
  </div>
  <hr />
  <h3>CTF Settings</h3>
  <div v-if="config">
    <div class="mb-3 row">
      <label class="col-sm-3 col-form-label"
        >Maintenance Mode
        <label class="form-text">In maintenance mode, challenges are hidden and flag submission is disabled globally.</label></label
      >
      <div class="col-sm-9 pt-2">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" v-model="config.maintenance" />
        </div>
      </div>
    </div>
    <div class="mb-3 row">
      <label class="col-sm-3 col-form-label"
        >CTF Time<label class="form-text"
          >After the finish time, flag submission will be disabled but challenges will still be visible.</label
        ></label
      >
      <div class="col-sm-9">
        <date-picker v-model="ctfTimeRange" mode="dateTime" :masks="masks" is-range is-required @update:modelValue="dateRangeChanged">
          <template v-slot="{ inputValue, inputEvents, isDragging }">
            <div class="row">
              <div class="col">
                <input
                  class="form-control"
                  :class="isDragging ? 'text-gray-600' : 'text-gray-900'"
                  :value="inputValue.start"
                  v-on="inputEvents.start"
                />
              </div>
              <div class="col-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  class="bi bi-arrow-right"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
                  />
                </svg>
              </div>
              <div class="col">
                <input
                  class="form-control"
                  :class="isDragging ? 'text-gray-600' : 'text-gray-900'"
                  :value="inputValue.end"
                  v-on="inputEvents.end"
                />
              </div>
            </div>
          </template>
        </date-picker>
      </div>
    </div>
    <div class="mb-3 row">
      <label class="col-sm-3 col-form-label"
        >Max Team Size<label class="form-text">Maximum number of members in a team, including the team captain.</label></label
      >
      <div class="col-sm-9"><input type="number" class="form-control" v-model="config.maxTeamSize" /></div>
    </div>
    <div class="mb-3 row">
      <label class="col-sm-3 col-form-label"
        >Location Precision (metres)<label class="form-text"
          >Precision in metres for challenges where users submit a location.</label
        ></label
      >
      <div class="col-sm-9"><input type="number" class="form-control" v-model="config.locationFlagPrecision" /></div>
    </div>

    <div class="mb-3 row">
      <label class="col-sm-3 col-form-label"
        >Scoring Type<label class="form-text"
          >Dynamic scoring will reduce the amount of points a challenge is worth based on the number of solves.</label
        ></label
      >
      <div class="col-sm-9">
        <select class="form-control" v-model="config.scoringType">
          <option value="static">Static</option>
          <option value="dynamic">Dynamic</option>
        </select>
      </div>
    </div>
    <template v-if="config.scoringType === 'dynamic'">
      <div class="mb-3 row">
        <label class="col-sm-3 col-form-label"
          >Dynamic Scoring Decay<label class="form-text">The amount of solves before points will be at a minimum.</label></label
        >
        <div class="col-sm-9"><input type="number" class="form-control" v-model="config.dynamicScoreDecay" /></div>
      </div>
      <div class="mb-3 row">
        <label class="col-sm-3 col-form-label"
          >Dynamic Scoring Minimum Points<label class="form-text">The minimum amount of points a challenge can be worth.</label></label
        >
        <div class="col-sm-9"><input type="number" class="form-control" v-model="config.dynamicScoreMinPoints" /></div>
      </div>
    </template>
    <button class="btn btn-success" @click="updateConfig">Update Settings</button>
  </div>
</template>

<script lang="ts" setup>
import { DatePicker } from "v-calendar";
import { onMounted, reactive, ref } from "vue";
import type { Config } from "../../types/Config";
import type { AdminStats } from "../../types/Stats";
import API from "../../utils/api";

const stats = ref<AdminStats>();
const config = ref<Config>();

const ctfTimeRange = {
  start: new Date(),
  end: new Date(),
};
const masks = {
  input: "YYYY-MM-DD h:mm A",
};

const dateRangeChanged = (newDate: { start: Date; end: Date }) => {
  const startTime = newDate.start;
  const endTime = newDate.end;

  startTime.setSeconds(0);
  startTime.setMilliseconds(0);
  endTime.setSeconds(0);
  endTime.setMilliseconds(0);

  config.value!.startTime = newDate.start.toISOString();
  config.value!.endTime = newDate.end.toISOString();
};

onMounted(async () => {
  const statsResponse = await API.getAdminStats();

  if (statsResponse) stats.value = statsResponse;

  const configResponse = await API.getConfig();

  if (configResponse) {
    config.value = configResponse;
    ctfTimeRange.start = new Date(config.value.startTime);
    ctfTimeRange.end = new Date(config.value.endTime);
  }
});

const updateConfig = async () => {
  const response = await API.updateConfig(config.value!);

  // TODO: Add proper success/error messages
  alert(response ? "Successfully updated settings!" : "Failed to update settings!");
};
</script>
