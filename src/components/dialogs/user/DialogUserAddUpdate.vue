<template>
  <q-dialog v-model="dialog.show" @hide="dialog.onHide">
    <q-card style="width: 600px; max-width: 100%">
      <q-form @submit="onSubmit">
        <q-card-section class="q-dialog__header">
          <div class="q-dialog__header-content">
            <div class="text-grey">{{ this.userRoleName() }}</div>
            <div class="q-dialog__title">
              {{
                dialog.method === "add"
                  ? "Новый " + this.userRoleName()
                  : dialog.data.name
              }}
            </div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-dialog__body">
          <!-- Имя -->
          <div class="q-mb-md">
            <div class="label">
              {{ User.fields.name.label }}
              {{ User.fields.name.required ? "*" : "" }}
            </div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.name"
              :min="User.fields.name.min"
              :max="User.fields.name.max"
              :required="User.fields.name.required"
              :rules="[(val) => User.fields.name.rules(val)]"
            />
          </div>
          <!-- Фамилия -->
          <div class="q-mb-md">
            <div class="label">
              {{ User.fields.surname.label }}
              {{ User.fields.surname.required ? "*" : "" }}
            </div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.surname"
              :min="User.fields.surname.min"
              :max="User.fields.surname.max"
              :required="User.fields.surname.required"
              :rules="[(val) => User.fields.surname.rules(val)]"
            />
          </div>
          <!-- Отчество -->
          <div class="q-mb-md">
            <div class="label">
              {{ User.fields.patronymic.label }}
              {{ User.fields.patronymic.required ? "*" : "" }}
            </div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.patronymic"
              :min="User.fields.patronymic.min"
              :max="User.fields.patronymic.max"
              :required="User.fields.patronymic.required"
              :rules="[(val) => User.fields.patronymic.rules(val)]"
            />
          </div>
          <!-- Email -->
          <div class="q-mb-md">
            <div class="label">
              {{ User.fields.email.label }}
              {{ User.fields.email.required ? "*" : "" }}
            </div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.email"
              :min="User.fields.email.min"
              :max="User.fields.email.max"
              :required="User.fields.email.required"
              :rules="[(val) => User.fields.email.rules(val)]"
            />
          </div>
          <!-- Телефон -->
          <div class="q-mb-md">
            <div class="label">
              {{ User.fields.phone.label }}
              {{ User.fields.phone.required ? "*" : "" }}
            </div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.phone"
              prefix="+7"
              :mask="User.fields.phone.mask"
              unmasked-value
              :min="User.fields.phone.min"
              :max="User.fields.phone.max"
              :required="User.fields.phone.required"
              :rules="[(val) => User.fields.phone.rules(val)]"
            >
              <template v-slot:prepend>
                <q-icon name="phone" />
              </template>
            </q-input>
          </div>
          <!-- Пароль -->
          <div class="q-mb-md" v-if="dialog.method === 'add'">
            <div class="label">
              {{ User.fields.password.label }}
              {{ User.fields.password.required ? "*" : "" }}
            </div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.password"
              :type="showPassword ? 'text' : 'password'"
              :min="User.fields.password.min"
              :max="User.fields.password.max"
              :required="User.fields.password.required"
              :rules="[(val) => User.fields.password.rules(val)]"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>
          <!-- Повтор пароля -->
          <div class="q-mb-md" v-if="dialog.method === 'add'">
            <div class="label">
              {{ User.fields.password2.label }}
              {{ User.fields.password2.required ? "*" : "" }}
            </div>
            <q-input
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="dialog.data.password2"
              :type="showPassword ? 'text' : 'password'"
              :min="User.fields.password2.min"
              :max="User.fields.password2.max"
              :required="User.fields.password2.required"
              :rules="[
                (val) => User.fields.password2.rules(val),
                (val) => val === dialog.data.password,
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>
          <!-- Роль -->
          <div class="q-mb-md" v-if="this.$q.appStore.user.roleId < 3">
            <div class="label">
              {{ User.fields.roleId.label }}
              {{ User.fields.roleId.required ? "*" : "" }}
            </div>
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
              :rules="[(val) => User.fields.roleId.rules(val)]"
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
              {{ User.fields.isDeleted.label }}
              {{ User.fields.isDeleted.required ? "*" : "" }}
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
              :rules="[(val) => User.fields.isDeleted.rules(val)]"
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
            unelevated
            color="negative"
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

import UserClass from "src/utils/classes/User.Class";

export default defineComponent({
  name: "DialogUserAddUpdate",

  props: ["dialog"],

  emits: {
    onSave: null,
    onRemove: null,
  },

  setup() {
    const User = new UserClass();
    return {
      User,
      showPassword: ref(false),
    };
  },

  methods: {
    userRoleName() {
      let string = "";
      switch (this.dialog.data.roleId) {
        case 4:
          string = "клиент";
          break;
        case 3:
          string = "оператор";
          break;
        case 2:
          string = "администратор";
          break;
        case 1:
          string = "суперадминистратор";
          break;
        default:
          break;
      }
      return string;
    },

    async onSubmit() {
      if (this.processing) return;
      this.processing = true;
      const result = await this.User.save(
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
      const result = await this.User.delete(this.dialog.data.id);
      this.processing = false;
      this.$emit("onRemove", result);
    },
  },
});
</script>
