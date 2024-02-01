<template>
  <q-dialog class="q-dialog--component" v-model="this.$q.dialogStore.show" @before-hide="this.$q.dialogStore.hide()">
    <q-card style="width:300px; max-width:100%;">
      <q-card-section class="q-dialog__header">
        <div class="q-dialog__header-content">
          <div class="q-dialog__title">{{this.$q.dialogStore.title}}</div>
        </div>
        <q-btn icon="close" flat round dense v-close-popup/>
      </q-card-section>
      <q-card-section
        class="q-dialog__body"
        v-if="this.$q.dialogStore.text || this.$q.dialogStore.html"
        v-html="this.$q.dialogStore.text ? this.$q.dialogStore.text : this.$q.dialogStore.html"
      />
      <q-card-section class="q-dialog__footer">
        <template v-if="this.$q.dialogStore.cancel">
          <q-btn
            class="q-btn--outline-muted"
            outline
            :label="this.$q.dialogStore.cancel.label ? this.$q.dialogStore.cancel.label : 'ОТМЕНА'"
            v-close-popup
          />
        </template>
        <q-btn
          unelevated
          :label="this.$q.dialogStore.ok && this.$q.dialogStore.ok.label ? this.$q.dialogStore.ok.label : 'OK'"
          :color="this.$q.dialogStore.ok && this.$q.dialogStore.ok.color ? this.$q.dialogStore.ok.color : 'primary'"
          v-close-popup="!this.$q.dialogStore.ok || !this.$q.dialogStore.ok.fn"
          @click="this.$q.dialogStore.ok && this.$q.dialogStore.ok.fn ? this.$q.dialogStore.ok.fn() : undefined"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DialogComponent'
})
</script>
