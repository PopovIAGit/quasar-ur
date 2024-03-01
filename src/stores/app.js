import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    ready: false,
    user: null,
    theme: [],
    service: [],
    ticket:[],
    selectedTicket: null,
  }),
  getters: {},
  actions: {
    set (data) {
      Object.entries(data).forEach(([key, value]) => {
        this[key] = value;
      });
    },
  },
});
