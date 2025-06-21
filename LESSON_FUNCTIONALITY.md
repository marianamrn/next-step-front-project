# Lesson Management Functionality

## Overview

The lesson management system provides comprehensive functionality for creating, viewing, editing, and managing lessons within courses. The system supports three main lesson types: lectures, tests, and extra materials, each with their own specific content and file handling capabilities.

## Lesson Types

### 1. Lecture (Лекція)
- **Content**: Text content (Markdown supported) or PDF/DOCX files
- **Duration**: Configurable duration in minutes
- **File Support**: PDF, DOCX uploads with preview and download capabilities

### 2. Test (Тест)
- **Source Types**: 
  - External URL (Google Forms, etc.)
  - Internal test system
- **Configuration**: Time limits, passing scores
- **External Links**: Direct access to external test platforms

### 3. Extra Material (Додатковий матеріал)
- **Material Types**:
  - Text content (Markdown supported)
  - URL links
  - Files (PDF, DOCX, images, videos)
  - Video content
  - Image content
- **File Support**: Multiple file types with preview and download

## API Endpoints

### Lesson Management
```javascript
// Get lesson by ID
GET /api/lessons/{lessonId}

// Get lessons by module
GET /api/modules/{moduleId}/lessons

// Create lesson
POST /api/lessons/manage

// Update lesson
PUT /api/lessons/manage/{lessonId}

// Delete lesson
DELETE /api/lessons/manage/{lessonId}
```

### File Handling
```javascript
// Get lesson file URL
export const getLessonFileUrl = (filePath) => {
  if (!filePath) return ''
  
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }
  
  const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath
  return `${API_URL}/storage/${cleanPath}`
}
```

## Components

### 1. LessonView.vue
**Location**: `src/components/lessons/LessonView.vue`

**Purpose**: Displays detailed lesson information with all content and materials

**Features**:
- Responsive design with modern UI
- Support for all lesson types
- File preview and download
- Video/image display
- Markdown rendering
- Navigation sidebar with lesson list
- Admin actions (edit, back navigation)

**Usage**:
```javascript
// Route: /admin/courses/:courseId/lesson/:lessonId
this.$router.push(`/admin/courses/${courseId}/lesson/${lessonId}`)
```

### 2. LessonEdit.vue
**Location**: `src/components/lessons/LessonEdit.vue`

**Purpose**: Edit lesson content and settings

**Features**:
- Form validation
- File upload handling
- Type-specific editing interfaces
- Current file display and download
- Responsive design

**Usage**:
```javascript
// Route: /admin/courses/:courseId/lesson/:lessonId/edit
this.$router.push(`/admin/courses/${courseId}/lesson/${lessonId}/edit`)
```

### 3. LessonExtendedModal.vue
**Location**: `src/components/admin/courses-management/LessonExtendedModal.vue`

**Purpose**: Create and edit lessons in modal interface

**Features**:
- Create new lessons
- Edit existing lessons
- File upload with preview
- Form validation
- Type-specific fields
- Real-time validation

### 4. LessonViewModal.vue
**Location**: `src/components/admin/courses-management/LessonViewModal.vue`

**Purpose**: Quick lesson preview in modal

**Features**:
- Quick lesson overview
- File preview
- Content display
- Edit/close actions

## Routing

### Admin Routes
```javascript
// Lesson view
{
  path: 'courses/:courseId/lesson/:lessonId',
  name: 'AdminLessonView',
  component: LessonView,
  props: true,
  meta: { roles: ['super_admin', 'admin', 'teacher'] },
  beforeEnter: checkRoleAccess(['super_admin', 'admin', 'teacher'])
}

// Lesson edit
{
  path: 'courses/:courseId/lesson/:lessonId/edit',
  name: 'AdminLessonEdit',
  component: LessonEdit,
  props: true,
  meta: { roles: ['super_admin', 'admin', 'teacher'] },
  beforeEnter: checkRoleAccess(['super_admin', 'admin', 'teacher'])
}
```

## File Upload Support

### Supported File Types
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Images**: JPG, JPEG, PNG, GIF
- **Videos**: MP4, AVI, MOV
- **Archives**: ZIP, RAR

### File Size Limits
- **Lesson Files**: 10 MB maximum
- **Material Files**: 10 MB maximum

### File Handling
```javascript
// Upload handling in forms
handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const maxSizeBytes = 10 * 1024 * 1024
  if (file.size > maxSizeBytes) {
    this.errors.file = `Розмір файлу перевищує 10 МБ`
    return
  }

  this.fileData = file
  // Create preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    this.filePreview = e.target.result
  }
  reader.readAsDataURL(file)
}
```

## Styling and UI

### Design System
- **Colors**: Gradient backgrounds, consistent color scheme
- **Typography**: Modern fonts with proper hierarchy
- **Spacing**: Consistent padding and margins
- **Responsive**: Mobile-first design approach

### Key CSS Classes
```css
.lesson-view-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.lesson-header {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.file-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}
```

## Validation

### Form Validation Rules
```javascript
validateForm() {
  let isValid = true

  // Title validation
  if (!this.form.title || !this.form.title.trim()) {
    this.errors.title = "Назва уроку є обов'язковою"
    isValid = false
  }

  // Type-specific validation
  if (this.form.type === 'lecture') {
    if (!this.form.content && !this.fileData && !this.filePreview) {
      this.errors.content = 'Додайте текст або файл'
      isValid = false
    }
  }

  return isValid
}
```

## Security and Permissions

### Role-Based Access
- **super_admin**: Full access to all lesson management
- **admin**: Full access to lesson management
- **teacher**: Full access to lesson management
- **student**: Read-only access to lessons

### File Security
- File type validation
- Size limits enforced
- Secure file storage paths
- Access control through authentication

## Usage Examples

### Creating a New Lesson
```javascript
// In LessonExtendedModal.vue
const lessonData = {
  title: 'Introduction to Vue.js',
  description: 'Learn the basics of Vue.js framework',
  module_id: '123',
  type: 'lecture',
  content: '# Vue.js Basics\n\nVue.js is a progressive framework...',
  duration_minutes: 45
}

const response = await lessonsApi.createLesson(lessonData)
```

### Viewing a Lesson
```javascript
// Navigate to lesson view
this.$router.push(`/admin/courses/${courseId}/lesson/${lessonId}`)

// Or open in modal
this.$emit('view-lesson', lesson)
```

### Editing a Lesson
```javascript
// Navigate to lesson edit
this.$router.push(`/admin/courses/${courseId}/lesson/${lessonId}/edit`)

// Or open in modal
this.$emit('edit-lesson', lesson)
```

## Error Handling

### API Error Handling
```javascript
try {
  const response = await lessonsApi.createLesson(lessonData)
  // Handle success
} catch (error) {
  console.error('Помилка при збереженні уроку:', error)
  
  let errorMessage = 'Помилка при збереженні уроку'
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message
  }
  
  alert(errorMessage)
}
```

### File Upload Errors
```javascript
// File size validation
if (file.size > maxSizeBytes) {
  this.errors.file = `Розмір файлу перевищує 10 МБ`
  return
}

// File type validation
const allowedTypes = ['.pdf', '.docx', '.jpg', '.png']
const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
if (!allowedTypes.includes(fileExtension)) {
  this.errors.file = 'Непідтримуваний тип файлу'
  return
}
```

## Best Practices

### Performance
- Lazy load lesson content
- Optimize file uploads
- Use proper caching strategies
- Implement pagination for large lesson lists

### User Experience
- Provide clear feedback for all actions
- Show loading states during operations
- Implement proper error messages
- Use consistent UI patterns

### Code Organization
- Separate concerns (view, edit, modal components)
- Use proper prop validation
- Implement proper event handling
- Follow Vue.js best practices

## Troubleshooting

### Common Issues

1. **File not displaying**: Check if `getLessonFileUrl` is properly constructing URLs
2. **Upload failures**: Verify file size and type restrictions
3. **Navigation issues**: Ensure proper route configuration
4. **Permission errors**: Check user role and authentication

### Debug Tips
```javascript
// Enable detailed logging
console.log('Lesson data:', lessonData)
console.log('File path:', filePath)
console.log('Constructed URL:', getLessonFileUrl(filePath))

// Check API responses
console.log('API response:', response.data)
```

## Future Enhancements

### Planned Features
- Rich text editor for content
- Video streaming integration
- Interactive quizzes
- Progress tracking
- Offline content access
- Advanced file management

### Technical Improvements
- WebSocket integration for real-time updates
- Advanced caching strategies
- Performance optimizations
- Enhanced security measures 