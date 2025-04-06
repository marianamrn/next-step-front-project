<!-- src/components/admin/AdminHeader.vue -->
<template>
    <div class="admin-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="user-info">
        <div class="avatar">{{ userInitials }}</div>
        <div class="user-details">
          <div class="user-name">{{ userName }}</div>
          <div class="user-role">{{ userRole }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AdminHeader',
    props: {
      pageTitle: {
        type: String,
        default: 'Студенти'
      },
      userName: {
        type: String,
        default: 'Михайлюк Ольга' // Тимчасово
      },
      userRole: {
        type: String,
        default: 'Super admin' // Тимчасово
      }
    },
    computed: {
      userInitials() {
        // Отримуємо ініціали користувача з імені
        if (!this.userName) return '';
        
        const parts = this.userName.split(' ');
        if (parts.length >= 2) {
          return parts[0].charAt(0) + parts[1].charAt(0);
        }
        return this.userName.charAt(0);
        
        /* Логіка для майбутньої інтеграції з API
        Після інтеграції з API можна отримувати дані користувача:
        const user = JSON.parse(localStorage.getItem('user'));
        return user ? (user.firstName.charAt(0) + user.lastName.charAt(0)) : '';
        */
      }
    }
  };
  </script>
  
  <style scoped>
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background-color: #fff;
    border-bottom: 1px solid #e1e1e1;
  }
  
  .page-title {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
  }
  
  .user-info {
    display: flex;
    align-items: center;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #e1e1e1;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 10px;
    font-weight: bold;
    color: #555;
  }
  
  .user-details {
    display: flex;
    flex-direction: column;
  }
  
  .user-name {
    font-weight: bold;
    font-size: 14px;
  }
  
  .user-role {
    font-size: 12px;
    color: #666;
  }
  </style>