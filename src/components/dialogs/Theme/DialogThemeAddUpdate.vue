<template>
  <q-dialog v-model="dialog.show" @hide="dialog.onHide">
    <q-card style="width: 600px; max-width: 100%">
      <q-form @submit="onSubmit">
        <q-card-section class="q-dialog__header">
          <div class="q-dialog__header-content">
            <div class="q-dialog__title" v-if="this.dialog.method === 'add'">
              Добавить группу
            </div>
            <div class="q-dialog__title" v-if="this.dialog.method === 'update'">
              Изменить группу
            </div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-dialog__body">
          <!-- Название -->
          <div class="q-mb-md">
            <div class="label">
              {{ Theme.fields.title.label }}
              {{ Theme.fields.title.required ? "*" : "" }}
            </div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.title"
              :min="Theme.fields.title.min"
              :max="Theme.fields.title.max"
              :required="Theme.fields.title.required"
              :rules="[(val) => Theme.fields.title.rules(val)]"
            />
          </div>
          <!-- Родительская тема :options="this.$q.helperTablesStore.themeTitles" -->
          <div class="q-mb-md">
            <div class="label">
              {{ Theme.fields.parentId.label }}
              {{ Theme.fields.parentId.required ? "*" : "" }}
            </div>
            <q-select
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.parentId"
              :options="optionsWithTitles"
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
              {{ Theme.fields.description.label }}
              {{ Theme.fields.description.required ? "*" : "" }}
            </div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.description"
              :min="Theme.fields.description.min"
              :max="Theme.fields.description.max"
              :required="Theme.fields.description.required"
              :rules="[(val) => Theme.fields.description.rules(val)]"
            />
          </div>
          <!-- Скрыть -->
          <div class="q-mb-md" v-if="this.$q.appStore.user.roleId < 3">
            <div class="label">
              {{ Theme.fields.hidden.label }}
              {{ Theme.fields.hidden.required ? "*" : "" }}
            </div>
            <q-checkbox
              outlined
              hide-bottom-space
              v-model="dialog.data.hidden"
              :rules="[(val) => Theme.fields.hidden.rules(val)]"
            />
          </div>
        </q-card-section>
        <q-card-section class="q-dialog__footer">
          <q-btn
            v-if="
              dialog.method === 'update' && this.$q.appStore.user.roleId < 3
            "
            unelevated
            color="negative"
            no-caps
            @click="onRemove"
            label="Удалить"
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
        <q-splitter />
        <q-card-section
          class="q-dialog__body"
          v-if="dialog.method === 'update' && this.$q.appStore.user.roleId < 3"
        >
          <!-- Добавить/Убрать доступ для  пользователя open group -->
          <div class="q-mb-md" v-if="dialog.data.hidden === false">
            <div class="label">
              Выберете пользователя для добавления/снятия доступа к группе
            </div>
            <q-select
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="this.selectedUser"
              :options="
                this.$q.appStore.usersList
                  .filter(
                    (item) => item.roleId === 3 && item.isDeleted == false
                  )
                  .map((item) => ({
                    id: item.id,
                    name: item.name + ' ' + item.surname,
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
          <div class="q-mb-md" v-if="dialog.data.hidden === true">
            <div class="label">
              Выберете пользователя для добавления/снятия доступа к скрытой
              группе
            </div>
            <q-select
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="this.selectedUser"
              :options="
                this.$q.appStore.usersList
                  .filter(
                    (item) =>
                      (item.roleId === 3 || item.roleId === 4) &&
                      item.isDeleted == false
                  )
                  .map((item) => ({
                    id: item.id,
                    name: item.name + ' ' + item.surname,
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
        </q-card-section>
        <q-card-section
          class="q-dialog__footer"
          v-if="dialog.method === 'update' && this.$q.appStore.user.roleId < 3"
        >
          <div v-if="dialog.data.hidden === false">
            <q-btn
              unelevated
              color="negative"
              no-caps
              @click="removeGroupAccessList"
              label="Убарать доступ"
            />
            <q-btn
              unelevated
              color="primary"
              no-caps
              @click="addGroupAccessList"
              label="Добавить доступ"
            />
          </div>
          <div v-else>
            <q-btn
              unelevated
              color="negative"
              no-caps
              @click="removeHiddenGroupAccessList"
              label="Убарать доступ"
            />
            <q-btn
              unelevated
              color="primary"
              no-caps
              @click="addHiddenGroupAccessList"
              label="Добавить доступ"
            />
          </div>
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from "vue";

import ThemeClass from "src/utils/classes/Theme.Class";

export default defineComponent({
  name: "DialogThemeAddUpdate",

  props: ["dialog"],

  emits: {
    onSave: null,
  },

  setup() {
    const Theme = new ThemeClass();
    return {
      Theme,
      selectedUser: ref(null),
    };
  },

  computed: {
    optionsWithTitles() {
      const tmp = [
        { id: null, name: "Без родительской темы" },
        ...this.$q.appStore.groupsList.map((item) => ({
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
      const result = await this.Theme.addGroup(
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
      const result = await this.Theme.removeGroup(this.dialog.data.id);
      this.processing = false;
      this.$emit("onRemove", result);
    },

    async addGroupAccessList() {
      if (this.processing) return;
      this.processing = true;

      const result = await this.Theme.addGroupAccessList(
        this.dialog.data.id,
        this.selectedUser
      );

      if (!result.success) {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: result.message,
          ok: {
            color: "red",
          },
        });
      } else if (result.success && result.group) {
        this.$q.dialogStore.set({
          show: true,
          title: "доступ добавлен",
        });
      }

      this.processing = false;
    },

    async removeGroupAccessList() {
      if (this.processing) return;
      this.processing = true;

      const result = await this.Theme.removeGroupAccessList(
        this.dialog.data.id,
        this.selectedUser
      );

      if (!result.success) {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: result.message,
          ok: {
            color: "red",
          },
        });
      } else if (result.success && result.group) {
        this.$q.dialogStore.set({
          show: true,
          title: "доступ удален",
        });
      }
    },

    async addHiddenGroupAccessList() {
      if (this.processing) return;
      this.processing = true;

      const result = await this.Theme.addHiddenGroupAccessList(
        this.dialog.data.id,
        this.selectedUser
      );

      if (!result.success) {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: result.message,
          ok: {
            color: "red",
          },
        });
      } else if (result.success && result.group) {
        this.$q.dialogStore.set({
          show: true,
          title: "доступ добавлен",
        });
      }

      this.processing = false;
    },

    async removeHiddenGroupAccessList() {
      if (this.processing) return;
      this.processing = true;

      const result = await this.Theme.removeHiddenGroupAccessList(
        this.dialog.data.id,
        this.selectedUser
      );

      if (!result.success) {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: result.message,
          ok: {
            color: "red",
          },
        });
      } else if (result.success && result.group) {
        this.$q.dialogStore.set({
          show: true,
          title: "доступ удален",
        });
      }
    },
  },
});
</script>
