<!-- src/components/admin/students/StudentRequests.vue -->
<template>
  <div>
    <!-- Таблиця запитів -->
    <div class="data-table">
      <div class="table-header">
        <div class="header-cell col-id">ID</div>
        <div class="header-cell col-name">Ім'я</div>
        <div class="header-cell col-surname">Прізвище</div>
        <div class="header-cell col-email">Email</div>
        <div class="header-cell col-phone">Номер телефону</div>
        <div class="header-cell col-type">Тип</div>
        <div class="header-cell col-actions">Дії</div>
      </div>
      <div class="table-body">
        <div v-for="request in requests" :key="request.id" class="table-row">
          <div class="cell col-id">{{ request.id }}</div>
          <div class="cell col-name">{{ request.firstName }}</div>
          <div class="cell col-surname">{{ request.lastName }}</div>
          <div class="cell col-email">{{ request.email }}</div>
          <div class="cell col-phone">{{ request.phone }}</div>
          <div class="cell col-type">{{ request.type }}</div>
          <div class="cell col-actions">
            <button class="action-button view" @click="viewRequest(request)">
              <v-icon>mdi-eye</v-icon>
            </button>
            <button class="action-button approve" @click="approveRequest(request)">
              <v-icon>mdi-check</v-icon>
            </button>
            <button class="action-button reject" @click="rejectRequest(request)">
              <v-icon>mdi-close</v-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudentRequests',
  props: {
    requests: {
      type: Array,
      required: true,
    },
  },
  methods: {
    viewRequest(request) {
      this.$emit('view-request', request)
    },
    approveRequest(request) {
      this.$emit('approve-request', request)
    },
    rejectRequest(request) {
      this.$emit('reject-request', request)
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VinnytsiaSansReg&display=swap');

* {
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.data-table {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  background-color: #f0f2f5;
  padding: 12px 0;
  font-weight: bold;
}

.header-cell {
  padding: 0 15px;
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.table-body {
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #e1e1e1;
  padding: 12px 0;
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  padding: 0 15px;
  display: flex;
  align-items: center;
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.col-id {
  width: 50px;
  flex-shrink: 0;
}

.col-name,
.col-surname {
  width: 150px;
  flex-shrink: 0;
}

.col-email {
  flex: 1;
  min-width: 200px;
}

.col-phone {
  width: 150px;
  flex-shrink: 0;
}

.col-type {
  width: 150px;
  flex-shrink: 0;
}

.col-actions {
  width: 120px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.action-button {
  width: 36px;
  height: 36px;
  border-radius: 5px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  cursor: pointer;
}

.view {
  background-color: #443bc9;
  color: white;
}

.approve {
  background-color: #4caf50;
  color: white;
}

.reject {
  background-color: #f44336;
  color: white;
}
</style>
