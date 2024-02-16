<template>
  <q-page>
    <div class="container">
      <h1>Главная</h1>
      <div class="colum-container">
        <div class="colum" v-if="User.roleId == 'super'|'administrator'">
          <q-list>
            <q-expansion-item
              expand-separator
              icon="perm_identity"
              label="Account settings"
              caption="John Doe"
            >
              <q-card>
                <q-card-section>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Quidem, eius reprehenderit eos corrupti commodi magni quaerat
                  ex numquam, dolorum officiis modi facere maiores architecto
                  suscipit iste eveniet doloribus ullam aliquid.
                </q-card-section>
              </q-card>
              </q-expansion-item>
          </q-list>
        </div>



        <q-table
          v-if="ready"
          class="table--users"
          color="primary"
          :rows="rows"
          :columns="columns"
          row-key="data"
          rows-per-page-label="Количество на странице"
          :rows-per-page-options="[5]"
          binary-state-sort
          v-model:pagination="pagination"
          @request="getData"
          :loading="loading"
        >
          <template v-slot:top="props">
            <div class="table-top">
              <div class="table-top__tabs"></div>
              <div class="table-top__assets">
                <div class="left">
                  <h4>ТИКЕТЫ</h4>
                </div>
                <div class="right">
                  <div class="q-gutter-md q-pb-md">
                    <q-btn
                      unelevated
                      no-caps
                      color="primary"
                      label="Создать тикет"
                      v-if="User.roleId == 3"
                    ></q-btn>
                    <q-select
                      outlined
                      bg-color="white"
                      v-model="selectStatus"
                      :options="optionsStatus"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-slot:bottom="props">
            <div class="table-bottom">
              <div class="table-bottom__show">
                <span>Показано:</span> <strong>1-5</strong> <span>из</span>
                <strong>9</strong>
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
          <template v-slot:no-data> Нет данных </template>
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
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";

import UserClass from "src/utils/classes/User.Class";

export default defineComponent({
  name: "IndexPage",

  setup() {
    const User = new UserClass();

    /** Columns */
    const columns = [
      { name: "id", label: "ID", field: "id", align: "left", sortable: true },
      {
        name: "title",
        label: "НАЗВАНИЕ",
        field: "title",
        align: "left",
        sortable: true,
      },
      {
        name: "description",
        label: "ОПИСАНИЕ",
        field: "description",
        align: "left",
        sortable: true,
      },
      {
        name: "status",
        label: "СТАТУС",
        field: "status",
        align: "left",
        sortable: true,
      },
    ];

    /** Page query */
    const query = useRoute().query;
    const pagination = {
      page: query.page ? parseInt("" + query.page) : 1,
      rowsPerPage: query.rowsPerPage ? parseInt("" + query.rowsPerPage) : 5,
      sortBy: query.sortBy || "id",
      descending: query.descending ? query.descending === "true" : true,
      rowsNumber: 0,
    };

    return {
      rows: ref([]),
      columns,
      pagination: ref(pagination),
      pagesNumber: ref(0),
      ready: ref(true),
      loading: ref(false),
      selectStatus: ref("Все"),
      optionsStatus: ["Все", "Новый", "Открыт", "Зыкрыт", "Восстановлен"],
      User,
    };
  },

  async beforeMount() {
    await this.getData();
  },

  methods: {
    async getData(props) {
      if (this.loading) return;
      this.loading = true;
      let { page, rowsPerPage, sortBy, descending } = props
        ? props.pagination
        : this.pagination;
      this.$router.replace({
        query: {
          rowsPerPage,
          page,
          sortBy,
          descending,
        },
      });

      const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "service",
        method: "getList",
        args: {
          limit: rowsPerPage,
          offset: (page - 1) * rowsPerPage,
          order: [[sortBy, descending ? "DESC" : "ASC"]],
          // roleId
          // limit: rowsPerPage,
          // offset: 0
        },
      });
      console.log("ответ", response);
      // Если ошибка получения списка пользователей
      if (response.type === "error") {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: "Ошибка получения списка тикетов",
          ok: {
            color: "red",
          },
        });
      }
      // Если получен список пользователей
      else if (response.type === "answer") {
        this.rows = response.args.rows;
        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.rowsNumber = response.args.count;
        this.pagination.sortBy = sortBy;
        this.pagination.descending = descending;
        this.pagesNumber = Math.ceil(
          response.args.count / this.pagination.rowsPerPage
        );
      }
      this.ready = true;
      this.loading = false;
    },
  },
});
</script>

<style lang="scss">
.colum-container {
  display: flex;
  width: 100%;
  flex-wrap: nowrap;

  .column {
    flex: 1;
    // Дополнительные стили столбцов
    & + .column {
      margin-left: 10px; // Пример отступа между столбцами
    }
  }
}
</style>
