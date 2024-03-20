<template>
  <q-dialog v-model="dialog.show" @hide="dialog.onHide">
    <q-card style="width: 600px; max-width: 100%">
      <q-form @submit="onSubmit">
        <q-card-section class="q-dialog__header">
          <div class="q-dialog__header-content">
            <div class="q-dialog__title">Добавить группу</div>
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
              {{ Theme.fields.groupId.label }}
              {{ Theme.fields.groupId.required ? "*" : "" }}
            </div>
            <q-select
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.groupId"
              :options= "optionsWithTitles"
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
        </q-card-section>
        <q-card-section class="q-dialog__footer">
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
    };
  },

  computed:{

    optionsWithTitles() {

      const tmp =
     [
      { id: null, name: 'Без родительской темы' },
      ...this.$q.appStore.groupsList.map(item => ({ id: item.id, name: item.title }))

    ];

     console.log(tmp);
     return tmp;
  }

  },

  methods: {
    async onSubmit() {
      if (this.processing) return;
      this.processing = true;
      const result = await this.Theme.save(this.dialog.method, this.dialog.data, this.dialog.dataWas);
        console.log("this.dialog.data",result);
      this.processing = false;
      this.$emit('onSave', result);
    },
  },
});
</script>
