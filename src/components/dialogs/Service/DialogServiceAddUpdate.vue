<template>
  <q-dialog v-model="dialog.show" @hide="dialog.onHide">
    <q-card style="width: 600px; max-width: 100%">
      <q-form @submit="onSubmit">
        <q-card-section class="q-dialog__header">
          <div class="q-dialog__header-content">
            <div class="q-dialog__title" v-if="this.dialog.method === 'add'">
              Добавить сервис
            </div>
            <div class="q-dialog__title" v-if="this.dialog.method === 'update'">
              Изменить сервис
            </div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-dialog__body">
          <!-- Название -->
          <div class="q-mb-md">
            <div class="label">
              {{ Service.fields.title.label }}
              {{ Service.fields.title.required ? "*" : "" }}
            </div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.title"
              :min="Service.fields.title.min"
              :max="Service.fields.title.max"
              :required="Service.fields.title.required"
              :rules="[(val) => Service.fields.title.rules(val)]"
            />
          </div>
          <!-- Родительская тема :options="this.$q.helperTablesStore.themeTitles" -->
          <div class="q-mb-md">
            <div class="label">
              {{ Service.fields.groupId.label }}
              {{ Service.fields.groupId.required ? "*" : "" }}
            </div>
            <q-select
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.groupId"
              :options="
                this.$q.appStore.groupsList.map((item) => ({
                  id: item.id,
                  name: item.title,
                }))
              "
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
              {{ Service.fields.description.label }}
              {{ Service.fields.description.required ? "*" : "" }}
            </div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.description"
              :min="Service.fields.description.min"
              :max="Service.fields.description.max"
              :required="Service.fields.description.required"
              :rules="[(val) => Service.fields.description.rules(val)]"
            />
          </div>
        </q-card-section>
        <q-card-section class="q-dialog__footer">
          <q-btn
            unelevated
            color="negative"
            no-caps
            @click="onRemove"
            label="Удалить"
            v-if="
              this.dialog.method === 'update' &&
              this.$q.appStore.user.roleId < 3
            "
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

import ServiceClass from "src/utils/classes/Service.Class";

export default defineComponent({
  name: "DialogServiceAddUpdate",

  props: ["dialog"],

  emits: {
    onSave: null,
  },

  setup() {
    const Service = new ServiceClass();
    return {
      Service,
    };
  },

  computed: {
    optionsWithTitles() {
      const tmp = [
        this.$q.appStore.servicesList.map((item) => ({
          id: item.id,
          name: item.title,
        })),
      ];

      return tmp;
    },
  },

  methods: {
    async onSubmit() {
      if (this.processing) return;
      this.processing = true;
      const result = await this.Service.save(
        this.dialog.method,
        this.dialog.data,
        this.dialog.dataWas
      );
      this.processing = false;
      this.$emit("onSave", result);
    },

    async onRemove() {
      if (this.processing) return;
      this.processing = true;
      const result = await this.Service.remove(this.dialog.data.id);
      this.processing = false;
      this.$emit("onRemove", result);
    },
  },
});
</script>
