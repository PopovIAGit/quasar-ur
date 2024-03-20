import { defineStore } from "pinia";

export const useFreeChatStore = defineStore("freeChat", {
  state: () => ({
    msgFromFreeChat: [
      {
        roomId: null,
        message: [
          {
            ownerId: null,
            content: null,
            sentDateTime: null,
          },
        ],
      },
    ],
  }),
  getters: {},
  actions: {
    set(data) {
      Object.entries(data).forEach(([key, value]) => {
        this[key] = value;
      });
    },
    delitRoom(roomToDel) {
      const indexToDelete = this.msgFromFreeChat.findIndex(
        (item) => item.roomId === roomToDel
      );
      if (indexToDelete !== -1) {
        this.msgFromFreeChat.splice(indexToDelete, 1);
      } else {
        console.log("Element with id", roomToDel, "not found.");
      }
    },
    addMsgToRoom(idToAdd, roomIdToAdd, contentToAdd) {
      let indexToChange = this.msgFromFreeChat.findIndex(
        (item) => item.roomId === roomIdToAdd
      );
      if (indexToChange === -1) {
        this.msgFromFreeChat.push({
          roomId: roomIdToAdd,
          message: [
            {
              ownerId: idToAdd,
              content: contentToAdd,
              sentDateTime: new Date(),
            },
          ],
        });
      } else {
        this.msgFromFreeChat[indexToChange].roomId = roomIdToAdd;
        this.msgFromFreeChat[indexToChange].message.push({
          ownerId: idToAdd,
          content: contentToAdd,
          sentDateTime: new Date(),
        });
      }
    }
  },
});
