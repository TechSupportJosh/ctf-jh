<template>
  <div id="category-breakdown-chart-container"></div>
</template>

<script lang="ts" setup>
import Highcharts from "highcharts";
import { computed, defineProps, onBeforeUnmount, onMounted, ref } from "vue";
import HighchartTheme from "../../assets/HighchartTheme";
import store from "../../plugins/store";
import type { UserChallengeSolve } from "../../types/Challenge";

const challenges = computed(() => store.state.challenges);

const props = defineProps({
  solvedChallenges: {
    default: { correct: 0, incorrect: 0 },
    type: Array as () => UserChallengeSolve[],
    required: true,
  },
});

const seriesData: Highcharts.PointOptionsObject[] = Object.keys(store.state.categories).map((category) => {
  return {
    name: category,
    y: props.solvedChallenges
      .filter((solvedChallenge) => {
        return (challenges.value.find((challenge) => challenge.id === solvedChallenge.challengeId)?.category ?? "") === category;
      })
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
  chart = Highcharts.chart("category-breakdown-chart-container", {
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
