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
      roomId:null,
      msg:[{
        id: null,
        content: null
      }]
    }]
  }),
  getters: {},
  actions: {
    set (data) {
      Object.entries(data).forEach(([key, value]) => {
        this[key] = value;
      });
    },
    delitRoom(idToDel) {
      const indexToDelete = this.msgFromFreeChat.findIndex(item => item.id === idToDel);
      if (indexToDelete !== -1) {
        this.msgFromFreeChat.splice(indexToDelete, 1);

      } else {
        console.log("Element with id", idToDel, "not found.");
      }
    },
    addMsgToRoom(idToAdd,roomIdToAdd, contentToAdd){
      let indexToChange = this.msgFromFreeChat.findIndex(item => item.roomId === roomIdToAdd);
      if (indexToChange === -1) {
        this.msgFromFreeChat.push({ id: idToAdd, roomId: roomIdToAdd,  content: [contentToAdd] });
      } else {
        this.msgFromFreeChat[indexToChange].id = idToAdd;
        this.msgFromFreeChat[indexToChange].roomId = roomIdToAdd;
        this.msgFromFreeChat[indexToChange].content.push(contentToAdd);

      }
    }
  },
});
