<!-- src/components/admin/ComingSoon.vue -->
<template>
    <div class="coming-soon">
      <div class="coming-soon-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <h2>Розділ в розробці</h2>
      <p>Функціональність "{{ feature }}" буде доступна незабаром.</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ComingSoon',
    props: {
      feature: {
        type: String,
        default: ''
      }
    }
  };
  </script>
  
  <style scoped>
  .coming-soon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 70px);
    text-align: center;
    color: #666;
    padding: 20px;
  }
  
  .coming-soon-icon {
    color: #443BC9;
    margin-bottom: 20px;
  }
  
  .coming-soon h2 {
    font-size: 24px;
    margin-bottom: 10px;
  }
  
  .coming-soon p {
    font-size: 16px;
  }
  </style>