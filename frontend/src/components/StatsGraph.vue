<template>
  <highchart :options="chartOptions"></highchart>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue";
import { Chart as Highchart } from "highcharts-vue";
import HighchartTheme from "../assets/HighchartTheme";
import Highcharts from "highcharts";
import timeAgo from "../utils/timeAgo";
import type { SolveStats } from "../types/Stats";

const props = defineProps({
  stats: {
    default: [],
    type: Array as () => SolveStats[],
    required: true,
  },
});

const daysToShow = 3;
const dataPoints = daysToShow * 24;
const millisecondsInHour = 1000 * 60 * 60;

const padData = (data: [number, number][]) => {
  // If they have no entries, round down to the nearest hour
  let firstDate = data.length
    ? data[0][0]
    : Math.round(new Date().getTime() / millisecondsInHour) * millisecondsInHour + millisecondsInHour;

  for (let i = data.length; i < dataPoints; i++) {
    firstDate -= 1000 * 60 * 60;
    data.unshift([firstDate, 0]);
  }

  return data;
};

const seriesData: Record<string, [number, number][]> = {
  points: [],
  bloods: [],
  solves: [],
};

props.stats.forEach((stat) => {
  const date = new Date(stat.date).getTime();
  seriesData.points.push([date, stat.points]);
  seriesData.bloods.push([date, stat.bloods]);
  seriesData.solves.push([date, stat.solves]);
});
seriesData.points = padData(seriesData.points);
seriesData.bloods = padData(seriesData.bloods);
seriesData.solves = padData(seriesData.solves);

const lastUpdated = props.stats.length ? props.stats[0].date : undefined;

const series = ref<Highcharts.SeriesOptionsType[]>([
  {
    name: "Points",
    type: "line",
    marker: {
      enabled: true,
    },
    events: {
      legendItemClick: () => false,
    },
    color: "var(--bs-primary)",
    data: seriesData.points,
  },
  {
    name: "Solves",
    type: "line",
    marker: {
      enabled: true,
    },
    events: {
      legendItemClick: () => false,
    },
    color: "var(--bs-warning)",
    data: seriesData.solves,
  },
  {
    name: "Bloods",
    type: "line",
    marker: {
      enabled: true,
    },
    events: {
      legendItemClick: () => false,
    },
    color: "var(--bs-danger)",
    data: seriesData.bloods,
  },
]);

Highcharts.setOptions(HighchartTheme);

const chartOptions: Highcharts.Options = {
  title: {
    text: "",
  },
  subtitle: {
    text: `Last updated ${lastUpdated ? timeAgo.format(new Date(lastUpdated)) : "never"}`,
  },
  chart: {
    type: "line",
    height: 500,
  },
  tooltip: {
    xDateFormat: "%d/%m %H:%M UTC",
  },
  xAxis: {
    type: "datetime",
    units: [["minute", [0, 15, 30, 45]]],
  },
  yAxis: {
    tickAmount: 10,
    tickInterval: 5,
    title: {
      text: "",
    },
  },
  series: series.value,
};
</script>
