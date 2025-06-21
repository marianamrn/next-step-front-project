<template>
  <div class="lesson-edit-container">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p>Завантаження даних уроку...</p>
    </div>

    <template v-else-if="lesson">
      <!-- Заголовок -->
      <div class="lesson-header">
        <div class="lesson-header-content">
          <div class="lesson-title-section">
            <h1>Редагування уроку</h1>
            <div class="lesson-meta">
              <span class="lesson-type">{{ getLessonTypeName(lesson.type) }}</span>
              <span class="lesson-position">Урок {{ lesson.position }}</span>
            </div>
          </div>
          <div class="lesson-actions">
            <v-btn color="secondary" variant="outlined" @click="goBack" class="back-btn">
              <v-icon left>mdi-arrow-left</v-icon>
              Назад
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Форма редагування -->
      <div class="lesson-edit-content">
        <v-form ref="form" v-model="valid">
          <v-card class="edit-form-card">
            <v-card-title>Основна інформація</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="formData.title"
                label="Назва уроку"
                :rules="[v => !!v || 'Введіть назву уроку']"
                required
              />
              
              <v-textarea
                v-model="formData.description"
                label="Опис уроку"
                rows="3"
              />

              <v-text-field
                v-model.number="formData.position"
                label="Позиція в модулі"
                type="number"
                min="1"
              />

              <v-select
                v-model="formData.status"
                label="Статус"
                :items="statusOptions"
                item-title="text"
                item-value="value"
              />
            </v-card-text>
          </v-card>

          <!-- Контент залежно від типу уроку -->
          <div class="lesson-specific-content">
            <!-- Лекція -->
            <v-card v-if="lesson.type === 'lecture'" class="content-card">
              <v-card-title>Контент лекції</v-card-title>
              <v-card-text>
                <v-tabs v-model="lectureTab" class="mb-4">
                  <v-tab value="text">Текстовий контент</v-tab>
                  <v-tab value="file">Файл</v-tab>
                </v-tabs>

                <v-window v-model="lectureTab">
                  <v-window-item value="text">
                    <v-textarea
                      v-model="formData.content"
                      label="Текстовий контент (Markdown)"
                      rows="10"
                      placeholder="# Заголовок 1&#10;&#10;## Заголовок 2&#10;&#10;Текст параграфа...&#10;&#10;**Жирний текст**&#10;&#10;*Курсив*"
                    />
                  </v-window-item>

                  <v-window-item value="file">
                    <div class="file-upload-section">
                      <v-file-input
                        v-model="formData.file"
                        label="Файл лекції (PDF, DOCX)"
                        accept=".pdf,.docx"
                        :rules="[v => !v || !Array.isArray(v) || v.length === 0 || (v[0] && v[0].size < 10 * 1024 * 1024) || 'Розмір файлу повинен бути менше 10 MB']"
                        prepend-icon="mdi-file-upload"
                      />
                      <div v-if="currentFile" class="current-file">
                        <p><strong>Поточний файл:</strong> {{ getFileName(currentFile) }}</p>
                        <v-btn
                          color="primary"
                          variant="outlined"
                          size="small"
                          @click="downloadCurrentFile"
                        >
                          <v-icon left>mdi-download</v-icon>
                          Завантажити
                        </v-btn>
                      </div>
                    </div>
                  </v-window-item>
                </v-window>

                <v-text-field
                  v-model.number="formData.duration_minutes"
                  label="Тривалість (хвилини)"
                  type="number"
                  min="1"
                />
              </v-card-text>
            </v-card>

            <!-- Тест -->
            <v-card v-if="lesson.type === 'test'" class="content-card">
              <v-card-title>Налаштування тесту</v-card-title>
              <v-card-text>
                <v-select
                  v-model="formData.source_type"
                  label="Тип джерела"
                  :items="sourceTypeOptions"
                  item-title="text"
                  item-value="value"
                />

                <v-text-field
                  v-if="formData.source_type === 'url'"
                  v-model="formData.external_url"
                  label="Посилання на тест"
                  placeholder="https://forms.google.com/..."
                />

                <v-text-field
                  v-model.number="formData.time_limit_minutes"
                  label="Обмеження часу (хвилини)"
                  type="number"
                  min="1"
                />

                <v-text-field
                  v-model.number="formData.passing_score"
                  label="Прохідний бал (%)"
                  type="number"
                  min="0"
                  max="100"
                />
              </v-card-text>
            </v-card>

            <!-- Додатковий матеріал -->
            <v-card v-if="lesson.type === 'extra_material'" class="content-card">
              <v-card-title>Додатковий матеріал</v-card-title>
              <v-card-text>
                <v-select
                  v-model="formData.material_type"
                  label="Тип матеріалу"
                  :items="materialTypeOptions"
                  item-title="text"
                  item-value="value"
                />

                <v-textarea
                  v-if="formData.material_type === 'text'"
                  v-model="formData.material_content"
                  label="Текстовий контент (Markdown)"
                  rows="8"
                />

                <v-text-field
                  v-if="formData.material_type === 'url'"
                  v-model="formData.material_url"
                  label="URL посилання"
                  placeholder="https://example.com/..."
                />

                <div v-if="['file', 'video', 'image'].includes(formData.material_type)" class="file-upload-section">
                   <v-file-input
                    v-model="formData.material_file"
                    label="Файл матеріалу"
                    accept=".pdf,.docx,.jpg,.jpeg,.png,.mp4"
                    :rules="[v => !v || !Array.isArray(v) || v.length === 0 || (v[0] && v[0].size < 50 * 1024 * 1024) || 'Розмір файлу повинен бути менше 50 MB']"
                    prepend-icon="mdi-file-upload"
                  />
                  <div v-if="currentMaterialFile" class="current-file">
                    <p><strong>Поточний файл:</strong> {{ getFileName(currentMaterialFile) }}</p>
                    <v-btn
                      color="primary"
                      variant="outlined"
                      size="small"
                      @click="downloadCurrentMaterialFile"
                    >
                      <v-icon left>mdi-download</v-icon>
                      Завантажити
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <div class="action-buttons">
            <v-btn @click="goBack" class="cancel-btn">Скасувати</v-btn>
            <v-btn
              color="primary"
              @click="saveLesson"
              :disabled="!valid || saving"
              :loading="saving"
              class="save-btn"
            >
              Зберегти
            </v-btn>
          </div>
        </v-form>
      </div>
    </template>
  </div>
</template>

<script>
import { lessonsApi, getLessonFileUrl } from '@/services/api.js'

export default {
  name: 'LessonEdit',
  props: {
    courseId: {
      type: [String, Number],
      required: true
    },
    lessonId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      lesson: null,
      loading: true,
      saving: false,
      valid: false,
      lectureTab: 'text',
      formData: {
        title: '',
        description: '',
        position: 1,
        status: 'active',
        content: '',
        file: null,
        duration_minutes: null,
        source_type: 'url',
        external_url: '',
        time_limit_minutes: null,
        passing_score: null,
        material_type: 'text',
        material_content: '',
        material_url: '',
        material_file: null,
      },
      statusOptions: [
        { value: 'active', text: 'Активний' },
        { value: 'inactive', text: 'Неактивний' },
      ],
      sourceTypeOptions: [
        { value: 'url', text: 'Зовнішнє посилання' },
        { value: 'internal', text: 'Внутрішній тест' },
      ],
      materialTypeOptions: [
        { value: 'text', text: 'Текст' },
        { value: 'url', text: 'Посилання' },
        { value: 'file', text: 'Файл' },
        { value: 'video', text: 'Відео' },
        { value: 'image', text: 'Зображення' },
      ],
    }
  },
  computed: {
    currentFile() {
      return this.lesson?.lecture?.file_path || null;
    },
    currentMaterialFile() {
      return this.lesson?.extra_material?.file_path || null;
    }
  },
  watch: {
    lesson: {
      handler(newVal) {
        if (newVal) {
          this.formData.title = newVal.title;
          this.formData.description = newVal.description;
          this.formData.position = newVal.position;
          this.formData.status = newVal.status;

          if (newVal.type === 'lecture' && newVal.lecture) {
            this.formData.content = newVal.lecture.content;
            this.formData.duration_minutes = newVal.lecture.duration_minutes;
          } else if (newVal.type === 'test' && newVal.test) {
            this.formData.source_type = newVal.test.source_type;
            this.formData.external_url = newVal.test.external_url;
            this.formData.time_limit_minutes = newVal.test.time_limit_minutes;
            this.formData.passing_score = newVal.test.passing_score;
          } else if (newVal.type === 'extra_material' && newVal.extra_material) {
            this.formData.material_type = newVal.extra_material.material_type;
            this.formData.material_content = newVal.extra_material.content;
            this.formData.material_url = newVal.extra_material.url;
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.loadLesson();
  },
  methods: {
    async loadLesson() {
      try {
        this.loading = true
        const response = await lessonsApi.getLessonById(this.lessonId)
        this.lesson = response.data.lesson
      } catch (error) {
        console.error('Помилка завантаження уроку:', error)
        alert('Не вдалося завантажити дані уроку.')
      } finally {
        this.loading = false
      }
    },
    async saveLesson() {
      if (!this.valid) return;

      try {
        this.saving = true;

        const lessonData = {
          title: this.formData.title,
          description: this.formData.description,
          position: Number(this.formData.position),
          status: this.formData.status,
        };

        if (this.lesson.type === 'lecture') {
          lessonData.duration_minutes = Number(this.formData.duration_minutes);
          
          // Надсилаємо або контент, або файл, залежно від активної вкладки
          if (this.lectureTab === 'text') {
            lessonData.content = this.formData.content;
          } else {
            const file = Array.isArray(this.formData.file) ? this.formData.file[0] : this.formData.file;
            if (file instanceof File) {
              lessonData.file = file;
            }
          }
        } else if (this.lesson.type === 'test') {
          lessonData.source_type = this.formData.source_type;
          lessonData.external_url = this.formData.external_url;
          lessonData.time_limit_minutes = Number(this.formData.time_limit_minutes);
          lessonData.passing_score = Number(this.formData.passing_score);
        } else if (this.lesson.type === 'extra_material') {
          lessonData.material_type = this.formData.material_type;
          
          // Залежно від типу матеріалу, надсилаємо лише відповідне поле
          switch(this.formData.material_type) {
            case 'text':
              lessonData.material_content = this.formData.material_content;
              break;
            case 'url':
              lessonData.material_url = this.formData.material_url;
              break;
            case 'file':
            case 'video':
            case 'image':
              const materialFile = Array.isArray(this.formData.material_file) ? this.formData.material_file[0] : this.formData.material_file;
              if (materialFile instanceof File) {
                lessonData.material_file = materialFile;
              }
              break;
          }
        }

        // Очищуємо зайві дані, щоб уникнути конфліктів на бекенді
        if (this.lesson.type === 'lecture') {
          if (lessonData.file) lessonData.content = null;
          if (lessonData.content) lessonData.file = null;
        } else if (this.lesson.type === 'extra_material') {
            if (lessonData.material_type !== 'text') lessonData.material_content = null;
            if (lessonData.material_type !== 'url') lessonData.material_url = null;
            if (lessonData.material_type !== 'file' && lessonData.material_type !== 'video' && lessonData.material_type !== 'image') {
                lessonData.material_file = null;
            }
        }

        Object.keys(lessonData).forEach(key => {
            if (lessonData[key] === null || lessonData[key] === undefined || (typeof lessonData[key] === 'number' && isNaN(lessonData[key]))) {
                delete lessonData[key];
            }
        });

        console.log('Фінальні дані для відправки:', lessonData);
        console.log('Типи даних:', Object.keys(lessonData).map(key => `${key}: ${typeof lessonData[key]}`));

        await lessonsApi.updateLesson(this.lessonId, lessonData);

        alert('Урок успішно оновлено');
        this.goBackToLessonView();
      } catch (error) {
        console.error('Помилка збереження уроку:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config
        });
        let errorMessage = 'Помилка збереження уроку.';
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
            if (error.response.data.errors) {
                errorMessage += ' ' + Object.values(error.response.data.errors).flat().join(' ');
            }
        }
        alert(errorMessage);
      } finally {
        this.saving = false;
      }
    },
    getLessonTypeName(type) {
      const types = {
        lecture: 'Лекція',
        test: 'Тест',
        extra_material: 'Додатковий матеріал'
      }
      return types[type] || type
    },
    getFileName(filePath) {
      if (!filePath) return ''
      if (filePath instanceof File) return filePath.name;
      return filePath.split('/').pop() || filePath
    },
    downloadCurrentFile() {
      if (!this.currentFile) return
      const url = getLessonFileUrl(this.currentFile)
      const link = document.createElement('a')
      link.href = url
      link.download = this.getFileName(this.currentFile)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    downloadCurrentMaterialFile() {
      if (!this.currentMaterialFile) return
      const url = getLessonFileUrl(this.currentMaterialFile)
      const link = document.createElement('a')
      link.href = url
      link.download = this.getFileName(this.currentMaterialFile)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    goBack() {
      this.$router.push(`/admin/courses/${this.courseId}`)
    },
    goBackToLessonView() {
      this.$router.push(`/admin/courses/${this.courseId}/lesson/${this.lessonId}`);
    }
  }
}
</script>

<style scoped>
.lesson-edit-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.lesson-header {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
}

.lesson-header-content {
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.lesson-title-section {
  flex: 1;
}

.lesson-title-section h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.lesson-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.lesson-type {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.lesson-position {
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
}

.lesson-actions {
  display: flex;
  gap: 12px;
}

.lesson-edit-content {
  max-width: 800px;
  margin: 0 auto;
}

.edit-form-card,
.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
}

.file-upload-section {
  margin-top: 16px;
}

.current-file {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.current-file p {
  margin: 0 0 12px 0;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
}

.cancel-btn,
.save-btn {
  min-width: 120px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-overlay p {
  margin-top: 16px;
  color: #666;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .lesson-edit-container {
    padding: 12px;
  }
  
  .lesson-header-content {
    flex-direction: column;
    padding: 24px;
  }
  
  .lesson-title-section h1 {
    font-size: 2rem;
  }
  
  .lesson-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style> 