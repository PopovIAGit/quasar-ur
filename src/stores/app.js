import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    ready: false,
    user: null,
    usersList: [],
    groupsList: [],
    servicesList: [],
    ticketsList:[],
    selectedTicket: null,
    numOfMsgInTicket: null,
    msgFromFreeChat: [{
      id: null,
      msg:[]
    }]
  }),
  getters: {},
  actions: {
    set (data) {
      Object.entries(data).forEach(([key, value]) => {
        this[key] = value;
      });
    },
    addRoom(idToAdd){
      this.msgFromFreeChat.push({id: idToAdd, msg:[]});
      console.log("add",this.msgFromFreeChat);
    },
    delitRoom(idToDel) {
      const indexToDelete = this.msgFromFreeChat.findIndex(item => item.id === idToDel);
      if (indexToDelete !== -1) {
        this.msgFromFreeChat.splice(indexToDelete, 1);

      } else {
        console.log("Element with id", idToDel, "not found.");
      }
    },
    addMsgToRoom(idToAdd, msg){
      let indexToChange = this.msgFromFreeChat.findIndex(item => item.id === idToAdd);
      if (indexToChange === -1) {
        this.msgFromFreeChat.push({ id: idToAdd, msg: [msg] });

      } else {
        this.msgFromFreeChat[indexToChange].msg.push(msg);

      }
    }
  },
});
