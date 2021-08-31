<template>
  <div id="team-breakdown-chart-container"></div>
</template>

<script lang="ts" setup>
import Highcharts from "highcharts";
import { computed, defineProps, onBeforeUnmount, onMounted, ref } from "vue";
import HighchartTheme from "../../assets/HighchartTheme";
import store from "../../plugins/store";
import type { TeamMember } from "../../types/Team";

const challenges = computed(() => store.state.challenges);

const props = defineProps({
  teamMembers: {
    default: [],
    type: Array as () => TeamMember[],
    required: true,
  },
});

const seriesData: Highcharts.PointOptionsObject[] = props.teamMembers.map((member) => {
  return {
    name: member.name,
    y: (member.solvedChallenges ?? [])
      .map((solvedChallenge) => {
        return challenges.value.find((challenge) => challenge.id === solvedChallenge.challengeId)?.points ?? 0;
      })
      .reduce((value, total) => total + value, 0),
  };
});

const series = ref<Highcharts.SeriesOptionsType[]>([
  {
    name: "Attempts",
    type: "pie",
    events: {
      legendItemClick: () => false,
    },
    data: seriesData,
  },
]);

Highcharts.setOptions(HighchartTheme);
let chart: Highcharts.Chart | null;

onMounted(() => {
  chart = Highcharts.chart("team-breakdown-chart-container", {
    title: {
      text: "",
    },
    chart: {
      type: "pie",
      height: 400,
    },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: true,
          format: `<b>{point.name}</b>: {point.y} points`,
        },
        enableMouseTracking: false,
      },
    },
    tooltip: {
      enabled: false,
    },
    series: series.value,
  });
});

onBeforeUnmount(() => {
  chart?.destroy();
});
</script>
