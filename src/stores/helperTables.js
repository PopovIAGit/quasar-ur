import { defineStore } from 'pinia'

export const useHelperTablesStore = defineStore('helperTables', {
  state: () => ({
    roles: [],
    rolesByID : {}
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
