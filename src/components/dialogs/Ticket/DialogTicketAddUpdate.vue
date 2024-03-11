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
          <!-- Родительская тема :options="this.$q.helperTablesStore.themeTitles" -->
          <div class="q-mb-md">
            <div class="label">
              {{ Ticket.fields.groupId.label }}
              {{ Ticket.fields.groupId.required ? "*" : "" }}
            </div>
            <q-select
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.groupId"
              :options= "this.$q.appStore.theme.map(item => ({ id: item.id, name: item.title }))"
              option-label="name"
              option-value="id"
              map-options
              emit-value
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
  name: "DialogServiceAddUpdate",

  props: ["dialog"],

  emits: {
    onSave: null,
    onRemove: null
  },
  setup() {
    const Ticket = new TicketClass();
    return {
      Ticket,
    };
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
      console.log(result);
      this.processing = false;
      this.$emit('onRemove', result);
    }
  },
});
</script>
