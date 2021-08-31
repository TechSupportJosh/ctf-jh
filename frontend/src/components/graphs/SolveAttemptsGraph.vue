<template>
  <div id="attempts-chart-container"></div>
</template>

<script lang="ts" setup>
import { defineProps, onBeforeUnmount, onMounted, ref } from "vue";
import HighchartTheme from "../../assets/HighchartTheme";
import Highcharts from "highcharts";
import type { AttemptStats } from "../../types/Stats";

const props = defineProps({
  solveAttempts: {
    default: { correct: 0, incorrect: 0 },
    type: Object as () => AttemptStats,
    required: true,
  },
});

const seriesData: Highcharts.PointOptionsObject[] = [
  {
    name: "Correct",
    color: "var(--bs-success)",
    y: props.solveAttempts.correct,
  },
  {
    name: "Incorrect",
    color: "var(--bs-danger)",
    y: props.solveAttempts.incorrect,
  },
];

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
  chart = Highcharts.chart("attempts-chart-container", {
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
          format: `<b>{point.name} Attempts</b>: {point.percentage:.1f}%`,
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
