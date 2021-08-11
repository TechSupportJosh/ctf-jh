<template>
  <div class="input-group mb-3 has-validation">
    <input
      type="text"
      class="form-control"
      :class="{
        'is-invalid': flagSubmissionError,
      }"
      readonly
      :value="flagString"
      placeholder="Latitude, Longitude"
    />
    <button class="btn btn-primary" type="button" data-bs-toggle="modal" :data-bs-target="`#mapModal-${challenge.id}`">View Map</button>
    <button class="btn" :class="`btn-${difficultyToClass(challenge.difficulty)}`" type="button" @click="emit('flagSubmitted', flagString)">
      Submit
    </button>
    <div class="invalid-feedback">{{ flagSubmissionError }}</div>
  </div>

  <div class="modal fade" tabindex="-1" :id="`mapModal-${challenge.id}`">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <strong>{{ challenge.title }}</strong>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>
            Click on the map below to select the location for <strong>{{ challenge.title }}</strong>
          </p>
          <div class="input-group mb-3 has-validation">
            <input
              type="text"
              class="form-control"
              :class="{
                'is-invalid': gmapsURLError,
              }"
              v-model="gmapsURL"
              placeholder="Google Maps URL"
            />
            <button class="btn btn-primary" type="button" @click="getLocationFromGMapsURL">Load Location</button>
            <div class="invalid-feedback">{{ gmapsURLError }}</div>
          </div>

          <div :id="`map-${challenge.id}`" style="height: 600px"></div>

          <p>Location Selected: {{ flagString }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { Challenge } from "../../types/Challenge";
import { difficultyToClass } from "../../utils/styling";
import L from "leaflet";
import { locationFlagPrecision } from "shared/config";

import "leaflet/dist/leaflet.css";

const flag = ref<L.LatLng>(new L.LatLng(52.3828467, -1.5610438));
const flagString = computed(() => `${flag.value.lat.toFixed(7)}, ${flag.value.lng.toFixed(7)}`);

const gmapsURL = ref("");
const gmapsURLError = ref("");

const emit = defineEmits(["flagSubmitted"]);
let map: L.Map | null = null;
let mapCircle: L.Circle | null = null;

const latLngRegex = /.*@(-?\d*.?\d*),(-?\d*.?\d*).*/gm;
const getLocationFromGMapsURL = () => {
  const matches = latLngRegex.exec(gmapsURL.value);
  gmapsURL.value = "";
  if (matches === null) return (gmapsURLError.value = "Failed to load location from URL");
  const latitude = parseFloat(matches[1]);
  const longitude = parseFloat(matches[2]);
  if (isNaN(latitude) || isNaN(longitude)) return (gmapsURLError.value = "Failed to load location from URL");
  flag.value = new L.LatLng(latitude, longitude);

  if (map && mapCircle) {
    map.setView(flag.value, 18);
    mapCircle.setLatLng(flag.value);
  }
};

const removeMap = () => {
  if (map) map.remove();
  map = null;
  mapCircle = null;
};

onMounted(() => {
  const mapModal = document.getElementById(`mapModal-${props.challenge.id}`);
  mapModal?.addEventListener("shown.bs.modal", () => {
    map = L.map(`map-${props.challenge.id}`).setView(flag.value, 16);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        'Base map and data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> and OpenStreetMap Foundation',
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(map);

    mapCircle = L.circle(flag.value, {
      color: "red",
      fillColor: "#f03",
      fillOpacity: 0.5,
      radius: locationFlagPrecision,
    }).addTo(map);

    map.on("click", (event) => {
      const clickEvent = event as L.LeafletMouseEvent;
      mapCircle?.setLatLng(clickEvent.latlng);
      flag.value = clickEvent.latlng.wrap();
    });
  });
  mapModal?.addEventListener("hidden.bs.modal", () => {
    removeMap();
  });
});

onBeforeUnmount(() => {
  // Ensure map is removed on component unmount
  removeMap();
});

const props = defineProps({
  challenge: {
    type: Object as () => Challenge,
    required: true,
  },
  flagSubmissionError: {
    type: String,
  },
});
</script>
