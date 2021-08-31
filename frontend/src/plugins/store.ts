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
    },
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setTeam(state, team) {
      state.team = team;
    },
  },
  actions: {
    async loadChallenges(context) {
      if (!context.state.user) return;

      const response = await API.getChallenges();

      if (!response) return;

      context.state.challenges = response;
      context.state.categories = {};

      // Store the count for each category
      context.state.challenges.forEach((challenge) => {
        if (!(challenge.category in context.state.categories)) context.state.categories[challenge.category] = 0;

        context.state.categories[challenge.category]++;
      });
    },
    async loadUser(context) {
      const user = await API.getUser();
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
      if (config) context.state.config = config;
    },
  },
});

export default store;
