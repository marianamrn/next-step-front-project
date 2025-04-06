<!-- src/components/admin/CourseForm.vue -->
<template>
    <div class="course-form">
      <div class="modal-header">
        <h2>{{ isEditing ? 'Редагування курсу' : 'Додавання курсу' }}</h2>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>Назва курсу</label>
            <input type="text" v-model="formData.title" placeholder="Введіть назву курсу">
          </div>
          <div class="form-group">
            <label>Категорія</label>
            <select v-model="formData.category">
              <option v-for="category in categories" :key="category.id" :value="category.name">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Обкладинка курсу</label>
          <div class="cover-upload">
            <div v-if="formData.coverImage" class="cover-preview">
              <img :src="formData.coverImage" alt="Cover preview">
              <button class="remove-cover" @click="removeCover">×</button>
            </div>
            <label v-else class="upload-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Завантажити обкладинку</span>
              <input type="file" @change="handleCoverUpload" accept="image/*" class="file-input">
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>Опис курсу</label>
          <textarea v-model="formData.description" placeholder="Введіть опис курсу" rows="4"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Ціна курсу (грн)</label>
            <input type="number" v-model="formData.price" placeholder="Введіть ціну">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="button cancel-btn" @click="$emit('close')">Скасувати</button>
        <button class="button save-btn" @click="saveCourse">Зберегти курс</button>
        <button 
          v-if="isEditing && !formData.published && formData.lessons && formData.lessons.length > 0" 
          class="button publish-btn" 
          @click="publishCourse"
        >
          Опублікувати курс
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CourseForm',
    props: {
      course: {
        type: Object,
        default: () => ({
          id: null,
          title: '',
          category: '',
          coverImage: null,
          description: '',
          price: 0,
          published: false,
          lessons: []
        })
      },
      categories: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        formData: { ...this.course }
      }
    },
    computed: {
      isEditing() {
        return !!this.formData.id;
      }
    },
    watch: {
      course: {
        handler(newCourse) {
          this.formData = { ...newCourse };
        },
        deep: true
      }
    },
    methods: {
      handleCoverUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Використовуємо FileReader для відображення завантаженого зображення
        const reader = new FileReader();
        reader.onload = e => {
          this.formData.coverImage = e.target.result;
        };
        reader.readAsDataURL(file);
        
        /* Логіка для майбутньої інтеграції з API
        const formData = new FormData();
        formData.append('cover', file);
        
        try {
          // const response = await axios.post('/api/upload/cover', formData);
          // this.formData.coverImage = response.data.url;
        } catch (error) {
          console.error('Помилка при завантаженні обкладинки:', error);
        }
        */
      },
      
      removeCover() {
        this.formData.coverImage = null;
        
        /* Логіка для майбутньої інтеграції з API
        // Якщо курс вже існує, можна відправити запит на видалення обкладинки
        if (this.formData.id) {
          // await axios.delete(`/api/courses/${this.formData.id}/cover`);
        }
        */
      },
      
      saveCourse() {
        if (!this.formData.title) {
          alert('Будь ласка, заповніть назву курсу');
          return;
        }
        
        this.$emit('save', { ...this.formData });
      },
      
      publishCourse() {
        if (this.formData.lessons.length === 0) {
          alert('Неможливо опублікувати курс без уроків. Додайте хоча б один урок.');
          return;
        }
        
        this.$emit('publish', { ...this.formData });
      }
    }
  };
  </script>
  
  <style scoped>
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #e1e1e1;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 20px;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
  }
  
  .form-row .form-group {
    flex: 1;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }
  
  .form-group input, .form-group textarea, .form-group select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e1e1e1;
    border-radius: 5px;
  }
  
  .cover-upload {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    border: 2px dashed #e1e1e1;
    border-radius: 5px;
    position: relative;
  }
  
  .upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }
  
  .upload-label span {
    margin-top: 10px;
    color: #666;
  }
  
  .file-input {
    position: absolute;
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    z-index: -1;
  }
  
  .cover-preview {
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  .cover-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .remove-cover {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 15px 20px;
    border-top: 1px solid #e1e1e1;
  }
  
  .button {
    padding: 8px 16px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    margin-left: 10px;
  }
  
  .cancel-btn {
    background-color: #f0f2f5;
    color: #333;
  }
  
  .save-btn {
    background-color: #443BC9;
    color: white;
  }
  
  .publish-btn {
    background-color: #4caf50;
    color: white;
  }
  </style>