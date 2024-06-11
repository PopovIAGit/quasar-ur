<template>
  <q-dialog v-model="dialog.show" @hide="dialog.onHide">
    <q-card style="width: 600px; max-width: 100%">
      <q-form @submit="onSubmit">
        <q-card-section class="q-dialog__header">
          <div class="q-dialog__header-content">
            <div class="q-dialog__title">Изменить тикет</div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-dialog__body">
          <!-- Название -->
          <div class="q-mb-md">
            <div class="label">
              {{ Ticket.fields.title.label }}
              {{ Ticket.fields.title.required ? "*" : "" }}
            </div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.title"
              :min="Ticket.fields.title.min"
              :max="Ticket.fields.title.max"
              :required="Ticket.fields.title.required"
              :rules="[(val) => Ticket.fields.title.rules(val)]"
            />
          </div>
          <!-- Описание -->
          <div class="q-mb-md">
            <div class="label">
              {{ Ticket.fields.description.label }}
              {{ Ticket.fields.description.required ? "*" : "" }}
            </div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.description"
              :min="Ticket.fields.description.min"
              :max="Ticket.fields.description.max"
              :required="Ticket.fields.description.required"
              :rules="[(val) => Ticket.fields.description.rules(val)]"
            />
          </div>
          <!-- ticketStatusId -->
          <div class="q-mb-md">
            <div class="label">
              {{ Ticket.fields.ticketStatusId.label }}
              {{ Ticket.fields.ticketStatusId.required ? "*" : "" }}
            </div>
            <q-select
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.ticketStatusId"
              :options= "optionsTicketsStatus"
              option-label = "name"
              option-value = "id"
              map-options
              emit-value
              :rules="[(val) => Ticket.fields.ticketStatusId.rules(val)]"
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
<!-- ownerID               -->
      <div class="q-mb-md" >
            <div class="label">
              {{ Ticket.fields.ownerId.label }}
              {{ Ticket.fields.ownerId.required ? "*" : "" }}
            </div>
            <q-select
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.ownerId"
              :options= "usersForOwner"
              :option-label="(item) => item === null ? 'Null value' : (`id: ${item.id} - ${item.name} ${item.surname}`)"
              :option-value="(item) => item === null ? 'Null value' : item.id "
              map-options
              emit-value
              :rules="[(val) => Ticket.fields.ownerId.rules(val)]"
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

        <!-- serviceID -->
        <div class="q-mb-md" >
            <div class="label">
              {{ Ticket.fields.serviceId.label }}
              {{ Ticket.fields.serviceId.required ? "*" : "" }}
            </div>
            <q-select
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.serviceId"
              :options= "servicesTitles"
              option-label="title"
              option-value="id"
              map-options
              emit-value
              :rules="[(val) => Ticket.fields.serviceId.rules(val)]"
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
          <!-- Удален -->
          <div class="q-mb-md" v-if="dialog.dataWas && dialog.dataWas.isDeleted === true">
            <div class="label">
              {{ Ticket.fields.isDeleted.label }}
              {{ Ticket.fields.isDeleted.required ? "*" : "" }}
            </div>
            <q-select
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.isDeleted"
              :options="[false, true]"
              option-label="name"
              option-value="id"
              map-options
              emit-value
              :rules="[(val) => Ticket.fields.isDeleted.rules(val)]"
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
        </q-card-section>
        <q-card-section class="q-dialog__footer">
          <q-btn
            class="q-btn--outline-muted"
            outline
            no-caps
            label="Удалить"
            @click="onRemove"
            v-if="dialog.method === 'update'"
          />
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
            type="submit"
            label="Сохранить"
          />
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from "vue";

import TicketClass from "src/utils/classes/Tiket.Class";

export default defineComponent({
  name: "DialogTicketAddUpdate",

  props: ["dialog"],

  emits: {
    onSave: null,
    onRemove: null
  },
  setup() {
    const Ticket = new TicketClass();


    return {
      Ticket,
      optionsTicketsStatus: [
        { id: 1, name: 'Новый' },
        { id: 2, name: 'Открыт' },
        { id: 3, name: 'Закры' },
        { id: 4, name: 'Восстановлен' }
      ],
      usersForOwner: ref([]),
      servicesTitles: ref([]),
    };
  },

   beforeMount() {
     this.getUsersForOwner();
     this.getServiseTitles();


  },

  updated() {
    //sconsole.ы(this.dialog.data);
  },

  methods: {
    async onSubmit() {
      if (this.processing) return;
      this.processing = true;
      const result = await this.Ticket.save(this.dialog.method, this.dialog.data, this.dialog.dataWas);
      this.processing = false;
      this.$emit('onSave', result);
    },

    async onRemove() {
      if (this.processing) return;
      this.processing = true;
      const result = await this.Ticket.remove(this.dialog.data.id);
      this.processing = false;
      this.$emit('onRemove', result);
    },
    async getUsersForOwner(){
      // if (this.$q.appStore.usersList != null) {
      //   this.usersForOwner = this.$q.appStore.usersList.filter((obj) => obj.roleId == 4 && obj.isDeleted == false);
      // }

      const response = await this.$q.ws.sendRequest({
        type: 'query',
        iface: 'person',
        method: 'getList',
        args: {
          where:{roleId: 4, isDeleted: false}
        }
      });
      // Если ошибка получения списка пользователей
      if (response.type === 'error') {
        this.$q.dialogStore.set({
          show: true,
          title: 'Ошибка',
          text: 'Ошибка получения списка пользователей',
          ok: {
            color: 'red'
          }
        });
      }
      // Если получен список пользователей
      else if (response.type === 'answer') {

        this.usersForOwner = response.args.rows;
      }
    },
    getServiseTitles() {
      if (this.$q.appStore.servicesList != null) {
         this.servicesTitles = this.$q.appStore.servicesList;
      }
    }
  },
});
</script>
