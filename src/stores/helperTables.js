import { defineStore } from 'pinia'

export const useHelperTablesStore = defineStore('helperTables', {
  state: () => ({
    roles: [],
    rolesByID : {},
    themeTitles: [],
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
