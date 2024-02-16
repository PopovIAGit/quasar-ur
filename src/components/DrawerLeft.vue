<template>

  <q-drawer
    class="drawer-left"
    show-if-above
    v-model="leftDrawerOpen"
    side="left"
    :width="250"
    :breakpoint="1200"
  >
    <div class="drawer-left__content">
      <div class="drawer-left__top">
        <div class="avatar"></div>
        <div class="name"> {{ this.$q.appStore.user.name }}</div>
        <q-btn outline color="dark" dense no-caps :ripple="false" label="Профиль" @click="showDialogUserAddUpdate"/>
      </div>
      <q-list padding class="drawer-left__menu">
        <q-item to="/" exact>
          <q-item-section avatar>
            <q-icon name="home"/>
          </q-item-section>
          <q-item-section>Главная</q-item-section>
        </q-item>
        <q-item to="/users" v-if="this.$q.appStore.user.roleId < 3">
          <q-item-section avatar>
            <q-icon name="supervisor_account"/>
          </q-item-section>
          <q-item-section>Пользователи</q-item-section>
        </q-item>
        <q-item to="/tickets">
          <q-item-section avatar>
            <q-icon name="list_alt"/>
          </q-item-section>
          <q-item-section>Тикеты</q-item-section>
        </q-item>
        <q-item to="/chat">
          <q-item-section avatar>
            <q-icon name="question_answer"/>
          </q-item-section>
          <q-item-section>Чат</q-item-section>
        </q-item>
        <q-item to="/style">
          <q-item-section avatar>
            <q-icon name="css"/>
          </q-item-section>
          <q-item-section>Стили</q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-drawer>

  <dialog-user-add-update
    :dialog="dialogUserAddUpdate"
    @onSave="onUserSave"
  />

</template>

<script>
import { defineComponent, ref } from 'vue'

import UserClass from 'src/utils/classes/User.Class'

import DialogUserAddUpdate from 'components/dialogs/user/DialogUserAddUpdate'

export default defineComponent({
  name: 'DrawerLeft',

  components: {
    DialogUserAddUpdate
  },

  setup () {
    /** User */
    const User = new UserClass();
    const dialogUserAddUpdateDefault = User.dialogAddUpdateDefault;

    return {
      User,
      dialogUserAddUpdateDefault,
      dialogUserAddUpdate: ref({}),
      leftDrawerOpen: ref(false)
    }
  },

  methods: {
    toggle () {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },

    showDialogUserAddUpdate () {
      this.dialogUserAddUpdate = {
        show: true,
        method: 'update',
        onHide: () => this.dialogUserAddUpdate = structuredClone(this.dialogUserAddUpdateDefault),
        dataWas: structuredClone(this.$q.appStore.user),
        data: structuredClone(this.$q.appStore.user)
      }
    },

    onUserSave (result) {
      if (!result.success) {
        if (result.noChanges) {
          this.$q.dialogStore.set({
            show: true,
            title: 'Нет изменений'
          });
        }
        else if (result.message) {
          this.$q.dialogStore.set({
            show: true,
            title: 'Ошибка',
            text: result.message,
            ok: {
              color: 'red'
            }
          });
        }
      }
      else if (result.success && result.user) {
        if (this.$q.appStore.user.id === result.user.id) {
          this.$q.appStore.set({
            user: result.user
          });
          this.$q.dialogStore.set({
            show: true,
            title: 'Профиль сохранён'
          });
          this.dialogUserAddUpdate.show = false;
        }
      }
    }
  }
})
</script>
