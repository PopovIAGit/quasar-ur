<template>
  <q-page>
    <div class="container">

      <q-breadcrumbs>
        <template v-slot:separator>
          <q-icon
            name="chevron_right"
            color="grey-6"
          />
        </template>
        <q-breadcrumbs-el icon="home" to="/"/>
        <q-breadcrumbs-el label="Пользователи"/>
      </q-breadcrumbs>

      <h1>Пользователи</h1>

      <q-table
        v-if="ready"
        class="table--users"
        :grid="$q.screen.lt.md"
        color="primary"
        :rows="rows"
        :columns="columns"
        row-key="id"
        rows-per-page-label="Количество на странице"
        :rows-per-page-options="[5]"
        binary-state-sort
        v-model:pagination="pagination"
        @request="getData"
        :loading="loading"
      >
        <template v-slot:top="props">
          <div class="table-top">
            <div class="table-top__tabs">
              <q-tabs
                v-model="tab"
                no-caps
                class="text-primary"
                align="left"
                @update:model-value="value => this.getData()"
              >
                <q-tab name="clients" label="Клиенты" :ripple="false"/>
                <q-tab name="operators" label="Операторы" :ripple="false"/>
                <q-tab name="administrators" label="Администраторы" :ripple="false"/>
              </q-tabs>
            </div>
            <div class="table-top__assets">
              <div class="left"/>
              <div class="right">
                <q-btn
                  unelevated dense
                  color="primary"
                  no-caps
                  :ripple="false"
                  icon="person_add"
                  :label="this.addUserButtonName()"
                  @click="showDialogUserAddUpdate"
                />
              </div>
            </div>
          </div>
        </template>
        <template v-slot:bottom="props">
          <div class="table-bottom">
            <div class="table-bottom__show">
              <span>Показано:</span> <strong>1-5</strong> <span>из</span> <strong>9</strong>
            </div>
            <div class="table-bottom__pagination">
              <q-pagination
                v-model="pagination.page"
                color="primary"
                :max="pagesNumber"
                :max-pages="6"
                direction-links
                :ripple="false"
              />
            </div>
          </div>
        </template>
        <template v-slot:no-data>
          Нет данных
        </template>
        <template v-slot:header-cell="props">
          <q-th :props="props" :data-field="props.col.name">
            {{ props.col.label }}
          </q-th>
        </template>
        <template v-slot:body-cell="props">
          <q-td :props="props" :data-field="props.col.name">
            {{ props.value }}
          </q-td>
        </template>
      </q-table>

    </div>
  </q-page>

  <dialog-user-add-update
    :dialog="dialogUserAddUpdate"
    @onSave="onUserSave"
  />

</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'

import UserClass from 'src/utils/classes/User.Class'

import DialogUserAddUpdate from 'components/dialogs/user/DialogUserAddUpdate'

export default defineComponent({
  name: 'UsersPage',

  components: {
    DialogUserAddUpdate
  },

  setup () {

    /** User */
    const User = new UserClass();
    const dialogUserAddUpdateDefault = User.dialogAddUpdateDefault;

    /** Columns */
    const columns = [
      { name:'id', label:'ID', field:'id', align:'left', sortable:true },
      {
        name:'fio',
        label:'Ф.И.О.',
        field: row => ((row.surname ? row.surname : '') + (row.name ? ' ' + row.name : '') + (row.patronymic ? ' ' + row.patronymic : '')).trim(),
        align:'left',
        sortable:true
      },
      { name:'phone', label:'Телефон', field: row => '+7' + row.phone, align:'left', sortable:true },
      { name:'email', label:'Email', field:'email', align:'left', sortable:true },
    ];

    /** Page query */
    const query = useRoute().query;
    const pagination = {
      page: query.page ? parseInt('' + query.page) : 1,
      rowsPerPage: query.rowsPerPage ? parseInt('' + query.rowsPerPage) : 5,
      sortBy: query.sortBy || 'id',
      descending: query.descending ? query.descending === 'true' : true,
      rowsNumber: 0
    };

    return {
      // table
      tab: ref('clients'),
      rows: ref([]),
      columns,
      pagination: ref(pagination),
      pagesNumber: ref(0),
      ready: ref(true),
      loading: ref(false),

      // user
      User,
      dialogUserAddUpdateDefault,
      dialogUserAddUpdate: ref({}),
    }
  },

  async beforeMount () {
    await this.getData();
  },

  methods: {
    async getData (props) {
      if (this.loading) return;
      this.loading = true;
      let { page, rowsPerPage, sortBy, descending } = props ? props.pagination : this.pagination;
      this.$router.replace({
        query: {
          rowsPerPage,
          page,
          sortBy,
          descending
        }
      });
      let roleId = undefined;
      switch (this.tab) {
        case 'clients':
          roleId = 4;
          break;
        case 'operators':
          roleId = 3;
          break;
        case 'administrators':
          roleId = 2;
          break;
        default: break;
      }
      const response = await this.$q.ws.sendRequest({
        type: 'query',
        iface: 'person',
        method: 'getList',
        args: {
          limit: rowsPerPage,
          offset: (page - 1) * rowsPerPage,
          order: [
            [sortBy, descending ? 'DESC' : 'ASC']
          ],
          where: {
            roleId
          },
          // roleId
          // limit: rowsPerPage,
          // offset: 0
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
        this.rows = response.args.rows;
        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.rowsNumber = response.args.count;
        this.pagination.sortBy = sortBy;
        this.pagination.descending = descending;
        this.pagesNumber = Math.ceil(response.args.count / this.pagination.rowsPerPage);
      }
      this.ready = true;
      this.loading = false;
    },

    addUserButtonName() {
      let string = 'Добавить ';
      switch (this.tab) {
        case 'clients':
          string += 'клиента';
          break;
        case 'operators':
          string += 'оператора';
          break;
        case 'administrators':
          string += 'администратора';
          break;
        default: break;
      }
      return string;
    },

    showDialogUserAddUpdate () {
      const excludeFields = ['id', 'token', 'isDeleted', 'online', 'active'];
      const data = {};
      Object.keys(this.dialogUserAddUpdateDefault.data).forEach(key => {
        if (!excludeFields.includes(key)){
          data[key] = this.dialogUserAddUpdateDefault.data[key];
        }
      });
      switch (this.tab) {
        case 'clients':
          data.roleId = 4;
          break;
        case 'operators':
          data.roleId = 3;
          break;
        case 'administrators':
          data.roleId = 2;
          break;
        default: break;
      }
      this.dialogUserAddUpdate = {
        show: true,
        method: 'add',
        onHide: () => this.dialogUserAddUpdate = structuredClone(this.dialogUserAddUpdateDefault),
        data
      }
    },

    onUserSave (result) {
      if (!result.success) {
        this.$q.dialogStore.set({
          show: true,
          title: 'Ошибка',
          text: result.message,
          ok: {
            color: 'red'
          }
        });
      }
      else if (result.success && result.user) {
        this.$q.dialogStore.set({
          show: true,
          title: 'Пользователь создан'
        });
        this.dialogUserAddUpdate.show = false;
        this.getData();
      }
    }
  }
})
</script>
