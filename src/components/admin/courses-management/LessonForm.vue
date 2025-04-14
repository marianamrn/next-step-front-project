<!-- src/components/admin/LessonForm.vue -->
<template>
  <div class="lesson-form">
    <div class="modal-header">
      <h2>{{ isEditing ? 'Редагування уроку' : 'Додавання уроку' }}</h2>
      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>Назва уроку</label>
        <input type="text" v-model="formData.title" placeholder="Введіть назву уроку">
      </div>
      <div class="form-group">
        <label>Контент уроку (опис)</label>
        <textarea v-model="formData.content" placeholder="Введіть опис уроку" rows="4"></textarea>
      </div>
      <div class="form-group">
        <label>Відео з YouTube (ID або повне посилання)</label>
        <input type="text" v-model="formData.videoUrl" placeholder="Наприклад: https://www.youtube.com/watch?v=dQw4w9WgXcQ або dQw4w9WgXcQ">
        <div v-if="formData.videoUrl" class="video-preview">
          <iframe 
            :src="getYouTubeEmbedUrl(formData.videoUrl)" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
      </div>
      <div class="form-group">
        <label>PDF-лекція (посилання на Google Drive)</label>
        <input type="text" v-model="formData.pdfUrl" placeholder="Введіть посилання на PDF-файл">
        <div v-if="formData.pdfUrl" class="resource-preview">
          <div class="pdf-icon">
            <v-icon color="white">mdi-file-pdf-box</v-icon>
          </div>
          <div class="resource-link">
            <a :href="formData.pdfUrl" target="_blank">{{ getPdfFileName(formData.pdfUrl) }}</a>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Google Form для завдань</label>
        <input type="text" v-model="formData.formUrl" placeholder="Введіть посилання на Google Form">
        <div v-if="formData.formUrl" class="resource-preview">
          <div class="form-icon">
            <v-icon color="white">mdi-file-document-outline</v-icon>
          </div>
          <div class="resource-link">
            <a :href="formData.formUrl" target="_blank">Google Form: Завдання до уроку</a>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="button cancel-btn" @click="$emit('close')">Скасувати</button>
      <button class="button save-btn" @click="saveLesson">Зберегти урок</button>
      <button 
        v-if="isEditing && !formData.published" 
        class="button publish-btn" 
        @click="publishLesson"
      >
        Опублікувати урок
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LessonForm',
  props: {
    lesson: {
      type: Object,
      default: () => ({
        id: null,
        title: '',
        content: '',
        videoUrl: '',
        pdfUrl: '',
        formUrl: '',
        published: false
      })
    }
  },
  data() {
    return {
      formData: { ...this.lesson }
    }
  },
  computed: {
    isEditing() {
      return !!this.formData.id;
    }
  },
  watch: {
    lesson: {
      handler(newLesson) {
        this.formData = { ...newLesson };
      },
      deep: true
    }
  },
  methods: {
    getYouTubeEmbedUrl(url) {
      // Отримання ID відео з YouTube-посилання
      let videoId = url;
      
      // Якщо це повне посилання, витягуємо ID
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        try {
          const urlObj = new URL(url);
          if (url.includes('youtube.com/watch')) {
            videoId = urlObj.searchParams.get('v');
          } else if (url.includes('youtu.be/')) {
            videoId = urlObj.pathname.split('/')[1];
          }
        } catch (e) {
          console.error('Неправильний формат URL:', e);
        }
      }
      
      return `https://www.youtube.com/embed/${videoId}`;
    },
    
    getPdfFileName(url) {
      try {
        // Спроба отримати назву файлу з URL
        const urlParts = new URL(url).pathname.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        // Якщо назва файлу довга, скорочуємо її
        if (fileName && fileName.length > 30) {
          return fileName.substring(0, 27) + '...';
        }
        
        return fileName || 'PDF-документ';
      } catch (e) {
        return 'PDF-документ';
      }
    },
    
    saveLesson() {
      if (!this.formData.title) {
        alert('Будь ласка, заповніть назву уроку');
        return;
      }
      
      this.$emit('save', { ...this.formData });
    },
    
    publishLesson() {
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

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
}

.video-preview {
  margin-top: 10px;
  height: 250px;
}

.video-preview iframe {
  width: 100%;
  height: 100%;
  border-radius: 5px;
}

.resource-preview {
  display: flex;
  align-items: center;
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
}

.pdf-icon, .form-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 5px;
  margin-right: 10px;
}

.pdf-icon {
  background-color: #f44336;
}

.form-icon {
  background-color: #4285f4;
}

.resource-link a {
  color: #443BC9;
  text-decoration: none;
}

.resource-link a:hover {
  text-decoration: underline;
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