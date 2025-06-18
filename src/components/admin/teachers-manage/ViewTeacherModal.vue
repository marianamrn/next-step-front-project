<template>
  <v-dialog
    :model-value="isViewModalOpen"
    @update:model-value="val => { if (!val) $emit('close') }"
    max-width="500px"
  >
    <v-card>
      <v-card-title>Деталі викладача</v-card-title>
      <v-card-text>
        <div class="info-row"><span class="label">Ім'я:</span> <span>{{ teacher?.name || '-' }}</span></div>
        <div class="info-row"><span class="label">Прізвище:</span> <span>{{ teacher?.last_name || '-' }}</span></div>
        <div class="info-row"><span class="label">Email:</span> <span>{{ teacher?.email || '-' }}</span></div>
        <div class="info-row"><span class="label">Код країни:</span> <span>{{ teacher?.country_code || '-' }}</span></div>
        <div class="info-row"><span class="label">Номер телефону:</span> <span>{{ teacher?.phone_number || '-' }}</span></div>
        <div class="info-row"><span class="label">Роль:</span> <span>{{ teacher?.role?.name || '-' }}</span></div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="$emit('close')">Закрити</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ViewTeacherModal',
  props: {
    isViewModalOpen: Boolean,
    teacher: Object,
  },
};
</script>

<style scoped>
.info-row { display: flex; margin-bottom: 10px; }
.label { width: 140px; color: #888; font-weight: 500; }
</style> 