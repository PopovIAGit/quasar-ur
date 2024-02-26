<template>
  <q-dialog v-model="dialog.show" @hide="dialog.onHide">
    <q-card style="width:600px; max-width:100%;">
      <q-form @submit="onSubmit">
        <q-card-section class="q-dialog__header">
          <div class="q-dialog__header-content">
            <div class="q-dialog__title">Добавить тему</div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section class="q-dialog__body">
          <!-- Название -->
          <div class="q-mb-md">
            <div class="label">{{ Theme.fields.name.label }} {{ Theme.fields.name.required ? '*': '' }}</div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.name"
              :min="Theme.fields.name.min"
              :max="Theme.fields.name.max"
              :required="Theme.fields.name.required"
              :rules="[ val => Theme.fields.name.rules(val) ]"
            />
          </div>
          <!-- Родительская тема -->
          <div class="q-mb-md">
            <div class="label">{{ Theme.fields.roleId.label }} {{ Theme.fields.roleId.required ? '*': '' }}</div>
            <q-select
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.roleId"
              :options="this.$q.helperTablesStore.roles"
              option-label="name"
              option-value="id"
              map-options
              emit-value
              :rules="[ val => User.fields.roleId.rules(val) ]"
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
            <div class="label">{{ Theme.fields.patronymic.label }} {{ Theme.fields.patronymic.required ? '*': '' }}</div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.patronymic"
              :min="User.fields.patronymic.min"
              :max="User.fields.patronymic.max"
              :required="User.fields.patronymic.required"
              :rules="[ val => User.fields.patronymic.rules(val) ]"
            />
          </div>
        </q-card-section>
        <q-card-section class="q-dialog__footer">
          <q-btn class="q-btn--outline-muted" outline no-caps label="Отмена" v-close-popup/>
          <q-btn unelevated color="primary" no-caps type="submit" label="Сохранить"/>
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from 'vue'

import ThemeClass from 'src/utils/classes/Theme.CLass'

export default defineComponent({
  name: 'DialogThemeAddUpdate',

  props: [
    'dialog'
  ],

  emits: {
    onSave: null
  },

  setup () {
    const Theme = new ThemeClass();
    return {
      Theme
    }
  },

  methods: {

    async onSubmit () {
      if (this.processing) return;
      this.processing = true;
      const result = await this.Theme.save(this.dialog.method, this.dialog.data, this.dialog.dataWas);
      this.processing = false;
      this.$emit('onSave', result);
    }
  }
})
</script>
