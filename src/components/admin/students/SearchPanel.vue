<!-- src/components/admin/students/SearchPanel.vue -->
<template>
  <div class="search-panel">
    <div v-if="activeTab === 'requests'" class="filter-panel">
      <span class="filter-label">Запити:</span>
      <div class="dropdown">
        <button class="dropdown-toggle">
          {{ selectedFilter }}
          <v-icon>mdi-chevron-down</v-icon>
        </button>
        <div class="dropdown-menu">
          <div class="dropdown-item" @click="setFilter('Всі')">Всі</div>
          <div class="dropdown-item" @click="setFilter('Перевірка оплати')">Перевірка оплати</div>
          <div class="dropdown-item" @click="setFilter('Доступно')">Доступно</div>
        </div>
      </div>
    </div>
    <div class="search-container">
      <input
        type="text"
        v-model="searchQuery"
        :placeholder="activeTab === 'students' ? 'Пошук (номер)' : 'Пошук'"
        class="search-input"
        @input="handleSearch"
      />
      <v-icon class="search-icon">mdi-magnify</v-icon>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchPanel',
  props: {
    activeTab: {
      type: String,
      required: true,
    },
    selectedFilter: {
      type: String,
      default: 'Всі',
    },
  },
  data() {
    return {
      searchQuery: '',
      searchTimeout: null,
    }
  },
  methods: {
    handleSearch() {
      // Робимо затримку для уникнення занадто частих запитів
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.$emit('search', this.searchQuery)
      }, 300)
    },
    setFilter(filter) {
      this.$emit('filter-change', filter)
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VinnytsiaSansReg&display=swap');

* {
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.search-panel {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filter-panel {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 10px;
  font-weight: 500;
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.dropdown-arrow {
  margin-left: 10px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  min-width: 150px;
  background-color: white;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-top: 5px;
  display: none;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.search-container {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 35px;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}
</style>
