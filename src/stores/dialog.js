import { defineStore } from 'pinia'

export const useDialogStore = defineStore('dialog', {
  state: () => ({
    show: false,
    title: '',
    text: '',
    html: '',
    ok: undefined,
    cancel: undefined
  }),
  getters: {},
  actions: {
    set (data) {
      Object.entries(data).forEach(([key, value]) => {
        this[key] = value;
      });
    },
    hide () {
      this.show = false;
      this.title = '';
      this.text = '';
      this.html = '';
      this.ok = undefined;
      this.cancel = undefined;
    }
  },
});
