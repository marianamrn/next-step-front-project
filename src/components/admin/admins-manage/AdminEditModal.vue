<template>
  <v-dialog
    :model-value="isEditModalOpen"
    @update:model-value="val => { if (!val) $emit('close') }"
    max-width="500px"
  >
    <v-card>
      <v-card-title>{{ title || 'Редагування' }}</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="formData.name"
            label="Ім'я"
            :rules="[v => !!v || 'Введіть ім\'я']"
            required
          />
          <v-text-field
            v-model="formData.last_name"
            label="Прізвище"
            :rules="[v => !!v || 'Введіть прізвище']"
            required
          />
          <v-text-field
            v-model="formData.email"
            label="Email"
            :rules="[v => !!v || 'Введіть email']"
            required
          />
          <v-text-field
            v-model="formData.country_code"
            label="Код країни"
            :rules="[v => !!v || 'Введіть код країни']"
            required
          />
          <v-text-field
            v-model="formData.phone_number"
            label="Номер телефону"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="$emit('close')">Скасувати</v-btn>
        <v-btn color="primary" @click="save" :disabled="!valid">Зберегти</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AdminEditModal',
  props: {
    isEditModalOpen: Boolean,
    admin: Object,
    title: String,
  },
  data() {
    return {
      valid: false,
      formData: {
        id: null,
        name: '',
        last_name: '',
        email: '',
        country_code: '',
        phone_number: '',
      },
    };
  },
  watch: {
    admin: {
      immediate: true,
      handler(val) {
        if (val) {
          this.formData = {
            id: val.id || null,
            name: val.name || '',
            last_name: val.last_name || '',
            email: val.email || '',
            country_code: val.country_code || '',
            phone_number: val.phone_number || '',
          };
        }
      },
    },
    isEditModalOpen(val) {
      if (!val) this.$refs.form && this.$refs.form.resetValidation();
    },
  },
  methods: {
    save() {
      if (!this.valid) return;
      this.$emit('save', { ...this.formData });
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VinnytsiaSansReg&display=swap');
* { font-family: 'VinnytsiaSansReg', sans-serif; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-container { background-color: white; border-radius: 8px; width: 500px; max-width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #e1e1e1; }
.modal-header h2 { margin: 0; font-size: 20px; font-family: 'VinnytsiaSansReg', sans-serif; }
.close-button { background: none; border: none; font-size: 24px; cursor: pointer; color: #666; font-family: 'VinnytsiaSansReg', sans-serif; }
.modal-body { padding: 20px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; }
.phone-container { display: flex; }
.phone-code-wrapper { margin-right: 8px; }
.phone-code { width: 50px; }
.phone-number { flex: 1; }
.modal-footer { display: flex; justify-content: flex-end; padding: 15px 20px; border-top: 1px solid #e1e1e1; }
.button { padding: 8px 16px; border-radius: 5px; border: none; cursor: pointer; font-weight: 500; font-family: 'VinnytsiaSansReg', sans-serif; }
.cancel-btn { background-color: #f0f2f5; color: #333; margin-right: 10px; }
.save-btn { background-color: #443bc9; color: #fff; }
.modal-loading { display: flex; flex-direction: column; justify-content: center; align-items: center; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #443bc9; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin-bottom: 10px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.error-message { color: #b91c1c; background: #fee2e2; border: 1px solid #f87171; border-radius: 5px; padding: 10px; margin-top: 10px; font-size: 0.9rem; }
</style> 