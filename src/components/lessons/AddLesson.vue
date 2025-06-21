<template>
  <div class="lesson-add-container">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p>Завантаження даних...</p>
    </div>

    <template v-else>
      <!-- Заголовок -->
      <div class="lesson-header">
        <div class="lesson-header-content">
          <div class="lesson-title-section">
            <h1>Додавання нового уроку</h1>
            <div class="lesson-meta">
              <span class="lesson-type">{{ getLessonTypeName(selectedType) }}</span>
              <span class="lesson-position">Модуль {{ moduleId }}</span>
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

      <!-- Форма додавання -->
      <div class="lesson-add-content">
        <v-form ref="form" v-model="valid">
          <!-- Вибір типу уроку -->
          <v-card class="type-selection-card">
            <v-card-title>Виберіть тип уроку</v-card-title>
            <v-card-text>
              <v-radio-group v-model="selectedType" class="lesson-type-radio">
                <v-radio
                  value="lecture"
                  label="Лекція"
                  class="lesson-type-option"
                >
                  <template v-slot:label>
                    <div class="lesson-type-label">
                      <v-icon color="#2196f3" class="mr-2">mdi-book-open-variant</v-icon>
                      <div>
                        <div class="lesson-type-name">Лекція</div>
                        <div class="lesson-type-description">Текстовий контент або файл з матеріалами</div>
                      </div>
                    </div>
                  </template>
                </v-radio>
                
                <v-radio
                  value="test"
                  label="Тест"
                  class="lesson-type-option"
                >
                  <template v-slot:label>
                    <div class="lesson-type-label">
                      <v-icon color="#4caf50" class="mr-2">mdi-clipboard-check</v-icon>
                      <div>
                        <div class="lesson-type-name">Тест</div>
                        <div class="lesson-type-description">Зовнішнє посилання або внутрішній тест</div>
                      </div>
                    </div>
                  </template>
                </v-radio>
                
                <v-radio
                  value="extra_material"
                  label="Додатковий матеріал"
                  class="lesson-type-option"
                >
                  <template v-slot:label>
                    <div class="lesson-type-label">
                      <v-icon color="#ff9800" class="mr-2">mdi-file-plus</v-icon>
                      <div>
                        <div class="lesson-type-name">Додатковий матеріал</div>
                        <div class="lesson-type-description">Текст, посилання, файл, відео або зображення</div>
                      </div>
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>
            </v-card-text>
          </v-card>

          <!-- Основна інформація -->
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
          <div v-if="selectedType" class="lesson-specific-content">
            <!-- Лекція -->
            <v-card v-if="selectedType === 'lecture'" class="content-card">
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
            <v-card v-if="selectedType === 'test'" class="content-card">
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
                  :rules="[
                    v => !!v || 'Введіть посилання на тест',
                    v => !v || /^https?:\/\/.+/.test(v) || 'Посилання повинно починатися з http:// або https://'
                  ]"
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
            <v-card v-if="selectedType === 'extra_material'" class="content-card">
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
                  :rules="[
                    v => !!v || 'Введіть URL посилання',
                    v => !v || /^https?:\/\/.+/.test(v) || 'URL повинен починатися з http:// або https://'
                  ]"
                />

                <div v-if="['file', 'video', 'image'].includes(formData.material_type)" class="file-upload-section">
                   <v-file-input
                    v-model="formData.material_file"
                    label="Файл матеріалу"
                    accept=".pdf,.docx,.jpg,.jpeg,.png,.mp4"
                    :rules="[v => !v || !Array.isArray(v) || v.length === 0 || (v[0] && v[0].size < 50 * 1024 * 1024) || 'Розмір файлу повинен бути менше 50 MB']"
                    prepend-icon="mdi-file-upload"
                  />
                </div>
              </v-card-text>
            </v-card>
          </div>

          <div class="action-buttons">
            <v-btn @click="goBack" class="cancel-btn">Скасувати</v-btn>
            <v-btn
              color="primary"
              @click="createLesson"
              :disabled="!valid || !selectedType || saving"
              :loading="saving"
              class="save-btn"
            >
              Створити урок
            </v-btn>
          </div>
        </v-form>
      </div>
    </template>
  </div>
</template>

<script>
import { lessonsApi } from '@/services/api.js'

export default {
  name: 'AddLesson',
  props: {
    courseId: {
      type: [String, Number],
      required: true
    },
    moduleId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      loading: false,
      saving: false,
      valid: false,
      selectedType: '',
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
  methods: {
    async createLesson() {
      if (!this.valid || !this.selectedType) return;

      try {
        this.saving = true;

        const lessonData = {
          module_id: Number(this.moduleId),
          type: this.selectedType,
          title: this.formData.title,
          description: this.formData.description,
          position: Number(this.formData.position),
          status: this.formData.status,
        };

        if (this.selectedType === 'lecture') {
          lessonData.duration_minutes = Number(this.formData.duration_minutes);
          
          // Надсилаємо або контент, або файл, залежно від активної вкладки
          if (this.lectureTab === 'text') {
            lessonData.content = this.formData.content;
          } else {
            const file = Array.isArray(this.formData.file) ? this.formData.file[0] : this.formData.file;
            if (file instanceof File) {
              // Перевіряємо розмір файлу (10MB для лекцій)
              const maxSize = 10 * 1024 * 1024;
              if (file.size > maxSize) {
                throw new Error(`Розмір файлу лекції повинен бути менше 10 MB`);
              }
              lessonData.file = file;
            }
          }
        } else if (this.selectedType === 'test') {
          lessonData.source_type = this.formData.source_type;
          lessonData.external_url = this.formData.external_url;
          lessonData.time_limit_minutes = Number(this.formData.time_limit_minutes);
          lessonData.passing_score = Number(this.formData.passing_score);
        } else if (this.selectedType === 'extra_material') {
          lessonData.material_type = this.formData.material_type;
          
          // Залежно від типу матеріалу, надсилаємо лише відповідне поле
          switch(this.formData.material_type) {
            case 'text':
              lessonData.content = this.formData.material_content;
              break;
            case 'url':
              lessonData.url = this.formData.material_url;
              break;
            case 'file':
            case 'video':
            case 'image':
              const materialFile = Array.isArray(this.formData.material_file) ? this.formData.material_file[0] : this.formData.material_file;
              if (materialFile instanceof File) {
                // Перевіряємо розмір файлу (50MB для відео, 10MB для інших)
                const maxSize = this.formData.material_type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
                if (materialFile.size > maxSize) {
                  throw new Error(`Розмір файлу повинен бути менше ${maxSize / (1024 * 1024)} MB`);
                }
                lessonData.material_file = materialFile;
              }
              break;
          }
        }

        // Очищуємо зайві дані, щоб уникнути конфліктів на бекенді
        if (this.selectedType === 'lecture') {
          if (lessonData.file) lessonData.content = null;
          if (lessonData.content) lessonData.file = null;
        } else if (this.selectedType === 'extra_material') {
            if (lessonData.material_type !== 'text') lessonData.content = null;
            if (lessonData.material_type !== 'url') lessonData.url = null;
            if (lessonData.material_type !== 'file' && lessonData.material_type !== 'video' && lessonData.material_type !== 'image') {
                lessonData.material_file = null;
            }
        }

        Object.keys(lessonData).forEach(key => {
            if (lessonData[key] === null || lessonData[key] === undefined || (typeof lessonData[key] === 'number' && isNaN(lessonData[key]))) {
                delete lessonData[key];
            }
        });

        console.log('Фінальні дані для створення:', lessonData);
        console.log('Тип уроку:', this.selectedType);
        console.log('Тип матеріалу:', this.formData.material_type);
        console.log('Файл матеріалу:', this.formData.material_file);
        console.log('Розмір файлу:', this.formData.material_file?.size);
        console.log('Тип файлу:', this.formData.material_file?.type);

        const response = await lessonsApi.createLesson(lessonData);
        
        alert('Урок успішно створено');
        this.goBack();
      } catch (error) {
        console.error('Помилка створення уроку:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config
        });
        
        let errorMessage = 'Помилка створення уроку.';
        
        if (error.response?.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
          if (error.response.data.errors) {
            const errorDetails = Object.values(error.response.data.errors).flat().join(' ');
            errorMessage += '\n\nДеталі помилки:\n' + errorDetails;
          }
        } else if (error.message) {
          errorMessage += '\n\n' + error.message;
        }
        
        // Показуємо помилку в модальному вікні замість alert
        this.$nextTick(() => {
          this.$refs.form?.setErrors([]);
          alert(errorMessage);
        });
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
    goBack() {
      this.$router.push(`/admin/courses/${this.courseId}`)
    }
  }
}
</script>

<style scoped>
.lesson-add-container {
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

.lesson-add-content {
  max-width: 800px;
  margin: 0 auto;
}

.type-selection-card,
.edit-form-card,
.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
}

.lesson-type-radio {
  margin-top: 16px;
}

.lesson-type-option {
  margin-bottom: 16px;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.lesson-type-option:hover {
  border-color: #667eea;
  background-color: #f8f9ff;
}

.lesson-type-option.v-radio--selected {
  border-color: #667eea;
  background-color: #f0f2ff;
}

.lesson-type-label {
  display: flex;
  align-items: center;
  width: 100%;
}

.lesson-type-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.lesson-type-description {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.4;
}

.file-upload-section {
  margin-top: 16px;
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
  .lesson-add-container {
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