import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    ready: false,
    user: null,
    selectedTicket: null,
    numOfMsgInTicket: null,
    usersList: [],
    groupsList: [],
    servicesList: [],
    ticketsList: [],
  }),
  getters: {},
  actions: {
    set(data) {
      Object.entries(data).forEach(([key, value]) => {
        this[key] = value;
      });
    },
  },
});
