<template>
  <q-page>
    <div class="container">
      <q-breadcrumbs>
        <template v-slot:separator>
          <q-icon name="chevron_right" color="grey-6" />
        </template>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Тикеты" />
      </q-breadcrumbs>

      <h1>Тикеты</h1>
      <!--Создание тикета-->
      <div
        class="q-gutter-md q-pb-md"
        v-if="selectTicketID == null && this.$q.appStore.user.roleId < 4"
      >
        <q-card>
          <q-card-section>
            <div class="q-pb-md">
              <div class="q-dialog__title">Тема</div>
            </div>
            <div class="q-gutter-md q-pb-md">
              <q-select
                outlined
                bg-color="white"
                hide-bottom-space
                v-model="model"
                :options="servicesTitles"
                option-label="name"
                option-value="id"
                map-options
                emit-value
                label="Выберете тему обращения"
                :rules="[(val) => val != null]"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-italic text-grey">
                      No options slot
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="q-pb-md">
              <div class="q-dialog__title">Назначенный пользователь</div>
            </div>
            <div class="q-gutter-md q-pb-md">
              <q-select
                outlined
                bg-color="white"
                hide-bottom-space
                v-model="modelusersForOwner"
                :options="usersForOwner"
                option-label="name"
                option-value="id"
                map-options
                emit-value
                label="Выберете пользователя"
                :rules="[(val) => val != null]"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-italic text-grey">
                      No options slot
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="q-pb-md row">
              <div class="q-dialog__title col-grow">Ваш тикет</div>
              <div class="text-grey col-lg-2">Заголовок тикета</div>
            </div>
            <div class="q-pb-md">
              <q-input outlined bg-color="white" v-model="ticketTitle" />
            </div>
            <div class="q-pb-md row justify-end">
              <div class="text-grey col-lg-2">Красткое описание тикета</div>
            </div>
            <div class="q-pb-md">
              <q-input
                outlined
                bg-color="white"
                v-model="ticketDiscription"
                type="textarea"
              />
            </div>
            <div class="q-dialog__footer q-pb-md">
              <q-btn unelevated no-caps icon="attach_file" />
              <q-btn
                unelevated
                outline
                no-caps
                color="primary"
                label="Отмена"
                to="/"
              />
              <q-btn
                unelevated
                no-caps
                color="primary"
                label="Создать"
                @click="createTicket"
              />
            </div>
            <q-separator />
          </q-card-section>
        </q-card>
      </div>
      <!--Работа с открытым тикетом-->
      <div class="q-pb-md" v-else-if="selectTicketID != null">
        <q-card>
          <q-card-section>
            <div class="row justify-between">
              <div class="col-lg-8 col-md-8 col-xs-12">
                <div class="q-dialog__title">ТИКЕТ</div>
                <p>{{ selectTicketID.title }}</p>
                <div class="q-dialog__title">Текст тикета</div>
                <p>{{ selectTicketID.description }}</p>
              </div>
              <div class="col-grow">
                <div class="row col-lg-9 col-md-9 col-xs-12 q-pb-md">
                  <div class="col-lg-10 col-md-9 col-xs-12 q-dialog__title">
                    Статус
                  </div>
                  <div class="col-lg-2 col-md-2 col-xs-12 q-pb-md text-right">
                    <q-badge align="middle" :class="colorStatus">
                      {{ textStatus }}</q-badge
                    >
                  </div>
                </div>
                <div class="row col-lg-9 col-md-9 col-xs-12 q-pb-md">
                  <div class="col-lg-8 col-md-7 col-xs-12 q-dialog__title">
                    Опертатор:
                    {{
                      selectTicketID.operators.length == 0
                        ? "не назначен"
                        : `${
                            this.$q.appStore.usersList.find(
                              (obj) => obj.id == selectTicketID.operators[0]
                            ).name
                          } ${
                            this.$q.appStore.usersList.find(
                              (obj) => obj.id == selectTicketID.operators[0]
                            ).surname
                          } (ID: ${selectTicketID.operators[0]})`
                    }}
                  </div>
                  <div class="col-lg-4 col-md-3 col-xs-12 q-pb-md text-right">
                    <q-btn
                      style="width: auto"
                      @click="showOperatorAddRemove"
                      unelevated
                      no-caps
                      color="primary"
                    >
                      {{
                        selectTicketID.operators.length == 0
                          ? "Добавить"
                          : "Удалить"
                      }}</q-btn
                    >
                  </div>
                </div>
                <div
                  class="q-pb-md col-lg-9 col-md-9 col-xs-12 row justify-evenly"
                >
                  <q-btn
                    unelevated
                    no-caps
                    color="primary"
                    label="ОТКРЫТЬ ЧАТ"
                    style="width: 40%"
                    to="/chat"
                  />
                  <q-btn
                    v-if="this.$q.appStore.user.roleId <= 2"
                    unelevated
                    no-caps
                    color="primary"
                    label="ИЗМЕНИТЬ"
                    style="width: 40%"
                    @click="showDialogTicketAddUpdate"
                  />
                </div>
                <div class="col-lg-9 col-md-9 col-xs-12 q-pb-md">
                  <div class="q-dialog__title">
                    <div class="row">
                      <div class="col-lg-10 col-md-9 col-xs-9 q-dialog__title">
                        Файлы
                      </div>

                      <q-btn
                        class="q-p-md"
                        @click="uploadTicketFile"
                        icon="attach_file"
                        round
                        flat
                      />
                    </div>
                  </div>
                  <q-scroll-area style="height: 350px">
                    <q-list separator>
                      <q-item
                        v-for="(option, index) in ticketFileList"
                        :key="index"
                        class="q-my-sm"
                        clickable
                        v-ripple
                        @click="downloadTicketSelectedFile(option)"
                      >
                        <q-item-section>{{ option.fileName }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-scroll-area>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <!-- модальное окно добавления удаления оператора -->
    <div>
      <q-dialog v-model="inception">
        <q-card v-if="selectTicketID.operators.length == 0">
          <q-card-section>
            <div class="text-h6">Добавить оператора</div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <q-select
              outlined
              v-model="selectOperator"
              option-label="name"
              option-value="id"
              map-options
              emit-value
              :options="
                this.$q.appStore.usersList
                  .filter((obj) => obj.roleId == 3 && obj.isDeleted == false)
                  .map((item) => ({
                    id: item.id,
                    name: item.name + ' ' + item.surname,
                  }))
              "
              label="Оператор"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              class="q-btn--outline-muted"
              outline
              no-caps
              label="Отмена"
              v-close-popup
            />
            <q-btn
              unelevated
              color="primary"
              no-caps
              label="Добавить"
              :disable="selectOperator == null ? true : false"
              @click="addOperator(selectOperator, selectTicketID.id)"
              hint="добавить оператора в тикет"
            />
          </q-card-actions>
        </q-card>
        <q-card v-else>
          <q-card-section>
            <div class="text-h6">Удалить оператора</div>
          </q-card-section>

          <q-card-section class="q-pa-md"> </q-card-section>

          <q-card-actions align="right">
            <q-btn
              class="q-btn--outline-muted"
              outline
              no-caps
              label="Отмена"
              v-close-popup
            />
            <q-btn
              unelevated
              color="negative"
              no-caps
              label="Удалить"
              @click="
                removeOperator(selectTicketID.id, selectTicketID.operators[0])
              "
              hint="Удалить оператора из тикета"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>

  <dialog-ticket-add-update
    :dialog="dialogTicketAddUpdate"
    @onSave="onTicketSave"
    @onRemove="onTicketRemove"
  />
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import DialogTicketAddUpdate from "components/dialogs/Ticket/DialogTicketAddUpdate";
import TicketClass from "src/utils/classes/Tiket.Class";
import Buffer from "vue-buffer";

export default defineComponent({
  name: "TicketPage",
  components: {
    DialogTicketAddUpdate,
  },
  setup() {
    const Ticket = new TicketClass();
    const dialogTicketAddUpdateDefault = Ticket.dialogAddUpdateDefault;
    return {
      model: ref(null),
      ready: ref(true),
      loading: ref(false),
      servicesTitles: ref([]),
      modelusersForOwner: ref(null),
      usersForOwner: ref([]),
      ticketFileList: ref([]),
      selectTicketID: ref(null),
      colorStatus: ref("bg-positive"),
      textStatus: ref("Новый"),
      ticketTitle: ref(""),
      ticketDiscription: ref(""),
      dialogTicketAddUpdate: ref({}),
      dialogTicketAddUpdateDefault,
      newFile: ref(null),
      Ticket,
      // модальное окно добавления удаления оператора
      inception: ref(false),
      selectOperator: ref(null),
    };
  },
  async beforeMount() {
    await this.getData();
    if (this.selectTicketID != null) {
      await this.getTicketFileList();
    }
  },

  methods: {
    async getData(props) {
      if (this.loading) return;

      this.loading = true;

      this.selectTicketID = this.$q.appStore.ticketsList.find(
        (obj) => obj.id == this.$q.appStore.selectedTicket?.id
      );

      console.log(this.selectTicketID);

      if (this.selectTicketID == null) {
        this.$q.appStore.set({ numOfMsgInTicket: 0 });
        if (this.$q.appStore.usersList != null) {
          this.usersForOwner = this.$q.appStore.usersList.filter(
            (obj) => obj.roleId == 4 && obj.isDeleted == false
          );
        }

        if (this.$q.appStore.servicesList != null) {
          this.servicesTitles = this.$q.appStore.servicesList.map(
            (obj) => obj.title
          );
        }
      } else {
        const response = await this.$q.ws.sendRequest({
          type: "query",
          iface: "message",
          method: "getList",
          args: {
            where: {
              ticketId: this.selectTicketID.id,
            },
          },
        });
        console.log(response.args.rows);

        const elementsWithTicketId = response.args.rows.filter(
          (element) => element.ticketId === this.selectTicketID.id
        );
        this.$q.appStore.set({ numOfMsgInTicket: elementsWithTicketId.length });

        switch (this.selectTicketID.ticketStatusId) {
          case 1:
            this.colorStatus = "bg-positive";
            this.textStatus = "Новый";
            break;
          case 2:
            this.colorStatus = "bg-positive";
            this.textStatus = "Открыт";
            break;
          case 3:
            this.colorStatus = "bg-negative";
            this.textStatus = "Закры";
            break;
          case 4:
            this.colorStatus = "bg-warning";
            this.textStatus = "Восстановлен";

            break;
        }
      }
      this.loading = false;
    },
    getIdFromTitle(title) {
      const item = data.find((obj) => obj.title === title);
      return item ? item.id : null;
    },
    async createTicket() {
      const foundItem = this.$q.appStore.servicesList.find(
        (item) => item.title === this.model
      );
      const foundId = foundItem ? foundItem.id : null;
      const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "ticket",
        method: "add",
        args: {
          ticket: {
            serviceId: foundId,
            ownerId: this.modelusersForOwner,
            title: this.ticketTitle,
            description: this.ticketDiscription,
            startDateTime: new Date(),
            ticketStatusId: 1,
          },
        },
      });

      if (response.type === "error") {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: "Ошибка создания списка тикетов",
          ok: {
            color: "red",
          },
        });
      }
      // Если тикет успешно создан
      else if (response.type === "answer") {
        this.$router.push({ path: "/" });
      }
    },
    // Диалог добавления/редактирования тикета
    showDialogTicketAddUpdate() {
      const excludeFields = ["id", "token", "isDeleted", "online", "active"];
      const data = {};
      Object.keys(this.dialogTicketAddUpdateDefault.data).forEach((key) => {
        if (!excludeFields.includes(key)) {
          data[key] = this.dialogTicketAddUpdateDefault.data[key];
        }
      });

      this.dialogTicketAddUpdate = {
        show: true,
        method: "update",
        onHide: () =>
          (this.dialogTicketAddUpdate = structuredClone(
            this.dialogTicketAddUpdateDefault
          )),
        dataWas: structuredClone(this.selectTicketID),
        data: structuredClone(this.selectTicketID),
      };
    },
    onTicketSave(result) {
      if (!result.success) {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: result.message,
          ok: {
            color: "red",
          },
        });
      } else if (result.success && result.ticket) {
        this.$q.dialogStore.set({
          show: true,
          title: "Тикет создан",
        });
        this.$q.appStore.set({ selectedTicket: result.ticket });
        this.dialogTicketAddUpdate.show = false;
        this.getData();
      }
    },
    onTicketRemove(result) {
      if (!result.success) {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: result.message,
          ok: {
            color: "red",
          },
        });
      } else if (result.success) {
        this.$q.dialogStore.set({
          show: true,
          title: "Тикет удален",
        });
        this.dialogTicketAddUpdate.show = false;
        this.$router.push("/");
      }
    },
    // файл сервер
    async getTicketFileList() {
      /** Получаем все списки файлов **/
      const responseFileList = await this.$q.ws.sendRequest({
        type: "query",
        iface: "file",
        method: "getList",
        args: {},
      });

      this.ticketFileList = responseFileList.args.rows.filter(
        (file) => file.ticketId === this.selectTicketID.id
      );
    },
    async downloadTicketSelectedFile(file) {
      try {
        const responseFile = await this.$q.ws.sendRequest({
          type: "query",
          iface: "file",
          method: "get",
          args: {
            file: {
              id: file.id,
            },
          },
        });
        if (responseFile.type == "answer") {
          const fileData = responseFile.args;
          const buf = Buffer.from(fileData.data.data);
          // const data1 = JSON.parse(buf);
          const blob = new Blob([buf], { type: fileData.type });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileData.fileName;
          link.click();
          URL.revokeObjectURL(url);
        } else {
          console.error("Failed to download file:", responseFile);
        }
      } catch (error) {
        console.error("Error occurred while downloading file:", error);
      }
    },
    async uploadTicketFile() {
      var input = document.createElement("input");
      input.type = "file";
      let buf = null;
      let filename = null;

      input.onchange = (e) => {
        // getting a hold of the file reference
        let file = e.target.files[0];
        let preparedFile = null;
        // setting up the reader
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);

        // here we tell the reader what to do when it's done reading...
        reader.onload = (readerEvent) => {
          let arrBuf = readerEvent.target.result; // this is the content as ArrayBuffer
          // Convert ArrayBuffer to Buffer
          buf = Buffer.from(arrBuf);
          filename = file.name;
          this.sendFileToServer(buf, filename);
        };
      };
      input.click();
    },
    async sendFileToServer(buf, filename) {
      // Send the prepared file to the server
      let rand;
      const responseUploadFile = await this.$q.ws.sendRequest({
        type: "query",
        iface: "file",
        method: "add",
        args: {
          file: {
            ownerId: this.$q.appStore.user.id,
            ticketId: this.selectTicketID.id,
            fileName: filename,
            data: buf,
          },
        },
      });
      this.getTicketFileList();
    },
    // Открытие модального окна добавления/удаления операторов
    showOperatorAddRemove() {
      this.inception = true;
    },
    async addOperator(userId, ticketId) {
      if (this.processing) return;
      this.processing = true;
      const result = await this.Ticket.addAccessList(ticketId, userId);
      this.processing = false;

      if (!result.success) {
        this.selectOperator = null;
        this.inception = false;
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: result.message,
          ok: {
            color: "red",
          },
        });
      } else {
        this.$q.appStore.set({ ticketsList: result.tickets });
        if (this.selectOperator) this.selectOperator = null;
        this.inception = false;
        await this.getData();
      }
    },
    async removeOperator(ticketId, userId) {
      if (this.processing) return;
      this.processing = true;
      const result = await this.Ticket.removeAccessList(ticketId, userId);
      this.processing = false;

      if (!result.success) {
        this.selectOperator = null;
        this.inception = false;
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: result.message,
          ok: {
            color: "red",
          },
        });
      } else {
        this.$q.appStore.set({ ticketsList: result.tickets });
        this.selectOperator = null;
        this.inception = false;
        await this.getData();
      }
    },
  },
});
</script>
