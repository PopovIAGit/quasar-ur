<template>
  <div class="login-window">
    <q-form @submit="onSubmit">
      <div class="q-mb-md">
        <div class="label">Телефон</div>
        <!-- Телефон -->
        <q-input
          outlined
          bg-color="white"
          hide-bottom-space
          v-model="phone"
          prefix="+7"
          :mask="User.fields.phone.mask"
          unmasked-value
          :min="User.fields.phone.min"
          :max="User.fields.phone.max"
          required
          :rules="[ val => User.fields.phone.rules(val) ]"
        >
          <template v-slot:prepend>
            <q-icon name="phone"/>
          </template>
        </q-input>
      </div>
      <!-- Пароль -->
      <div class="q-mb-md">
        <div class="label">{{ User.fields.password.label }} {{ User.fields.password.required ? '*': '' }}</div>
        <q-input
          outlined
          bg-color="white"
          hide-bottom-space
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          :min="User.fields.password.min"
          :max="User.fields.password.max"
          :required="User.fields.password.required"
          :rules="[ val => User.fields.password.rules(val) ]"
        >
          <template v-slot:prepend>
            <q-icon name="lock"/>
          </template>
          <template v-slot:append>
            <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPassword = !showPassword"/>
          </template>
        </q-input>
      </div>
      <div class="q-mb-lg row justify-between items-center">
        <q-checkbox v-model="remember" label="Запомнить"/>
        <span class="text-primary cursor-pointer">Забыли пароль?</span>
      </div>
      <q-btn unelevated no-caps color="primary" class="full-width" type="submit" label="Войти"/>
    </q-form>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

import UserClass from 'src/utils/classes/User.Class'

export default defineComponent({
  name: 'LoginWindow',

  setup () {
    const User = new UserClass();
    return {
      User,
      // Form fields
      phone: ref('0000000000'),
      password: ref('super'),
      remember: ref(false),
      // Show password
      showPassword: ref(false)
    }
  },

  methods: {
    async onSubmit () {
      const result = await this.User.login({
        phone: this.phone,
        password: this.password
      });
      // Если ошибка логина TODO
      if (!result.success) {

      }
      // Если успешный логин
      else if (result.success) {
        // Выполняем подготовительные действия, доступные только после успешной авторизации
        const resultAuthAfter = await this.User.authAfter();
        // Если ошибка
        if (!resultAuthAfter.success) {
          if (resultAuthAfter.message) {
            this.$q.dialogStore.set({
              show: true,
              title: 'Ошибка',
              html: resultAuthAfter.message,
              ok: {
                color: 'red'
              }
            });
          }
        }
      }
      console.log(result);
    }
  }

})
</script>
