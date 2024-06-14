import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    ready: false,
    user: null,
    usersList: [],
    groupsList: [],
    servicesList: [],
    ticketsList: [],
    selectedTicket: null,
    numOfMsgInTicket: null,
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
