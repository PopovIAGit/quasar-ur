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
        color="primary"
        :rows="rows"
        @row-dblclick="handleRowDoubleClick"
        :columns="columns"
        row-key="id"
        rows-per-page-label="Количество на странице"
        :rows-per-page-options="[5]"
        binary-state-sort
        v-model:pagination="pagination"
        @request="getTableData"
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
                @update:model-value="() => this.getTableData(null, {page: 1})"
              >
                <q-tab name="clients" label="Клиенты" :ripple="false"/>
                <q-tab name="operators" label="Операторы" :ripple="false"/>
                <q-tab name="administrators" label="Администраторы" :ripple="false"/>
              </q-tabs>
            </div>
            <div class="table-top__assets">
              <div class="left">
                <div class="search q-mr-lg">
                  <q-input
                    outlined
                    dense
                    bg-color="white"
                    hide-bottom-space
                    v-model="search"
                    autocomplete="off"
                  >
                    <template v-slot:append>
                      <q-icon v-if="search !== ''" name="close" @click="searchUser({reset: true})" class="cursor-pointer" />
                      <q-icon name="search" @click="searchUser" class="cursor-pointer"/>
                    </template>
                  </q-input>
                </div>
                <div>
                  <q-checkbox
                    v-model="showDeleted"
                    label="Показать удаленных"
                    @update:model-value="() => this.getTableData(null, {page: 1, isDeleted: true})"
                  />
                </div>
              </div>
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
              <span>Показано: </span>
              <strong>{{ ((pagination.page - 1) * pagination.rowsPerPage) + 1 }} - {{ ((pagination.page - 1) * pagination.rowsPerPage) + pagination.rowsPerPage }}</strong>
              <span> из </span>
              <strong>{{ pagination.rowsNumber }}</strong>
            </div>
            <div class="table-bottom__pagination">
              <q-pagination
                v-if="pagesNumber > 1"
                v-model="pagination.page"
                color="primary"
                :max="pagesNumber"
                :max-pages="6"
                direction-links
                :ripple="false"
                @update:model-value="() => getTableData()"
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
            <template v-if="props.col.name === 'online'">
              <q-badge
                :outline="!props.value"
                rounded
                :color="props.value === true ? 'positive' : 'grey-6'"
                :label="props.value === true ? 'В сети' : 'Не в сети'"
              />
            </template>
            <template v-else-if="props.col.name === 'isDeleted'">
              <q-badge
                v-if="props.value"
                rounded
                color="negative"
                label="Удалён"
              />
            </template>
            <template v-else>
              {{ props.value }}
            </template>
          </q-td>
        </template>
      </q-table>

    </div>
  </q-page>

  <dialog-user-add-update
    :dialog="dialogUserAddUpdate"
    @onSave="onUserSave"
    @onRemove = "onUserRemove"
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
        name:'surname',
        label:'Ф.И.О.',
        field: row => ((row.surname ? row.surname : '') + (row.name ? ' ' + row.name : '') + (row.patronymic ? ' ' + row.patronymic : '')).trim(),
        align:'left',
        sortable:true
      },
      { name:'phone', label:'Телефон', field: row => '+7' + row.phone, align:'left', sortable:true },
      { name:'email', label:'Email', field:'email', align:'left', sortable:true },
      { name:'online', label:'Статус', field:'online', align:'right', sortable:true },
      { name:'isDeleted', label:'Удалён', field:'isDeleted', align:'right', sortable:true }
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
    let filter = ref({});
    let tab = ref('clients');
    if (query.filter) {
      try {
        filter = JSON.parse(query.filter);
      }
      catch (e) {}
    }
    if (filter.roleId) {
      switch (filter.roleId) {
        case 4:
          tab = 'clients'
          break;
        case 3:
          tab = 'operators'
          break;
        case 2:
          tab = 'administrators'
          break;
        default:
          tab = 'clients';
          break;
      }
    }
    let showDeleted = ref(!!filter.isDeleted);
    const search = ref(query.search || '');

    return {
      // table
      tab,
      rows: ref([]),
      columns,
      pagination: ref(pagination),
      pagesNumber: ref(0),
      ready: ref(true),
      loading: ref(false),
      search,
      filter,
      showDeleted,

      // user
      User,
      dialogUserAddUpdateDefault,
      dialogUserAddUpdate: ref({}),
    }
  },

  async beforeMount () {
    await this.getTableData();
  },

  beforeRouteUpdate (to, from, next) {
    if (to.fullPath === '/users') {
      this.tab = 'clients';
      this.pagination.page = 1;
      this.pagination.sortBy = 'id';
      this.pagination.descending = true;
      this.search = '';
      next();
      setTimeout(() => {
        this.getTableData();
      }, 100);
    }
    else {
      next();
    }
  },

  methods: {
    async getTableData (props, params) {
      if (this.loading) return;
      this.loading = true
      let { page, rowsPerPage, sortBy, descending } = props ? props.pagination : this.pagination;
      if (params && params.page) {
        page = params.page;
      }
      // Дефолтная вкладка - клиенты
      let roleId = 4;
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
      let where = {
        roleId,
        isDeleted: this.showDeleted
      };
      if (params && params.where) {
        where = params.where;
      }
      this.$router.replace({
        query: {
          rowsPerPage,
          page,
          sortBy,
          descending,
          filter: JSON.stringify(where),
          search: this.$route.query.search,
        }
      });
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
          where,
          search: this.$route.query.search
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
      const excludeFields = ['id', 'token', 'online', 'active'];
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
        // Переключаем вкладку на нужную роль
        switch (result.user.roleId) {
          case 4:
            this.tab = 'clients'
            break;
          case 3:
            this.tab = 'operators'
            break;
          case 2:
            this.tab = 'administrators'
            break;
          default: break;
        }
        const where = {
          roleId: result.user.roleId,
          id: result.user.id
        }
        this.getTableData(null, {page: 1, where});
      }
    },
    onUserRemove (result) {
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
      else if (result.success) {
        this.$q.dialogStore.set({
          show: true,
          title: 'Пользователь удален'
        });
        this.dialogUserAddUpdate.show = false;
        // Переключаем вкладку на нужную роль
        this.getTableData();
      }
    },

    searchUser (params) {
      // Если сброс поиска или он пустой
      if ((params && params.reset) || this.search === '') {
        this.search = '';
        if (this.$route.query.search) {
          const query = structuredClone(this.$route.query);
          delete query.search;
          this.$router.push({
            path: this.$route.path,
            query: {
              ...query
            }
          });
          setTimeout(() => {
            this.getTableData();
          }, 100);
        }
        return;
      }
      // Если некорректное количество символов
      if (this.search.length < 3) return;
      // Если всё ок
      this.$router.push({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          search: this.search
        },
      });
      setTimeout(() => {
        this.getTableData();
      }, 100);
    },

    handleRowDoubleClick(event, row) {
    // Получите данные строки и выполните переход на другую страницу
    this.dialogUserAddUpdate = {
        show: true,
        method: 'update',
        onHide: () => this.dialogUserAddUpdate = structuredClone(this.dialogUserAddUpdateDefault),
        dataWas: structuredClone(row),
        data: structuredClone(row)
      }
  },
  }
})
</script>
