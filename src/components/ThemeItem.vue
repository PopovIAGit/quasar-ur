<template>
  <div>
    <q-expansion-item
      :key="theme.id"
      :label="theme.title"
      :caption="theme.description"
      v-if="hasChildren(theme)"
    >
      <template v-slot:default>
        <ThemeItem
          v-for="child in getChildItems(theme)"
          :theme="child"
          :themeList="themeList"
          :key="child.id"
        />
      </template>
    </q-expansion-item>

    <template v-else>
      <q-item :key="theme.id">
        <q-item-section>
          <q-item-label>
            {{ theme.title }}
          </q-item-label>
          <q-item-label caption lines="1">
            {{ theme.description }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    theme: Object,
    themeList: Array, // Добавляем prop для передачи списка тем
  },
  methods: {
    hasChildren(theme) {
      if (!this.themeList) return false;
      // Проверяем сначала наличие дочерних элементов для theme.id
      if (this.themeList.some((child) => child.parentId === theme.id)) {
        return true;
      }

      return false;
    },
    getChildItems(parentTheme) {
      if (!this.themeList) return [];
      return this.themeList.filter(
        (theme) => theme.parentId === parentTheme.id
      );
    },

  },
};
</script>
