<template>
  <v-dialog
    :model-value="isEditModalOpen"
    @update:model-value="val => { if (!val) $emit('close') }"
    max-width="500px"
  >
    <v-card>
      <v-card-title>{{ title || 'Редагування викладача' }}</v-card-title>
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
  name: 'TeacherEditModal',
  props: {
    isEditModalOpen: Boolean,
    teacher: Object,
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
    teacher: {
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