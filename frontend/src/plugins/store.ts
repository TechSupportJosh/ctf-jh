import Vuex from "vuex";
import { Challenge } from "../types/Challenge";
import { Config } from "../types/Config";
import { Team } from "../types/Team";
import { User } from "../types/User";
import API from "../utils/api";

export interface State {
  challenges: Challenge[];
  categories: Record<string, number>;
  user?: User;
  team?: Team;
  hideSolvedChallenges: boolean;
  config: Config;
}

const store = new Vuex.Store<State>({
  state: {
    challenges: [],
    categories: {},
    hideSolvedChallenges: false,
    config: {
      maxTeamSize: 5,
      locationFlagPrecision: 10,
      startTime: "",
      endTime: "",
      maintenance: false,
      scoringType: "static",
      dynamicScoreReduction: 5,
      dynamicScoreMinSolves: 3,
      dynamicScoreMaxSolves: 10,
    },
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setTeam(state, team) {
      state.team = team;
    },
    setChallenges(state, { challenges, categories }) {
      state.challenges = challenges;
      state.categories = categories;
    },
    setConfig(state, config) {
      state.config = config;
    },
  },
  actions: {
    async loadChallenges(context) {
      if (!context.state.user) return;

      const challenges = await API.getChallenges();

      if (!challenges) return;

      const categories: Record<string, number> = {};

      // Store the count for each category
      challenges.forEach((challenge) => {
        if (!(challenge.category in categories)) categories[challenge.category] = 0;

        categories[challenge.category]++;
      });

      context.commit("setChallenges", {
        challenges,
        categories,
      });
    },
    async loadUser(context) {
      const user = await API.getSelf();
      context.commit("setUser", user);
    },
    async loadTeam(context) {
      if (context.state.user?.team) {
        const team = await API.getTeam(context.state.user.team.id);
        context.commit("setTeam", team);
      } else {
        context.commit("setTeam", undefined);
      }
    },
    async loadConfig(context) {
      const config = await API.getConfig();
      if (config) context.commit("setConfig", config);
    },
  },
});

export default store;
