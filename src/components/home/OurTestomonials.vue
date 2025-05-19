<template>
  <section class="our-testomonials">
    <div class="container">
      <!-- Заголовок секції -->
      <div class="section-header">
        <p class="section-subtitle">OUR TESTOMONIALS</p>
        <h2 class="section-title">
          Що про нас говорять наші<br />
          студенти
        </h2>
      </div>

      <!-- Відгуки -->
      <div class="testimonials-container">
        <!-- Фото студентів -->
        <div class="students-avatars">
          <transition-group name="avatar-slide" tag="div" class="avatars-container">
            <div
              v-for="testimonial in reorderedTestimonials"
              :key="testimonial.id"
              :class="['avatar-wrapper', { active: isActive(testimonial.id) }]"
              @click="selectTestimonial(getOriginalIndex(testimonial.id))"
            >
              <div class="avatar-container">
                <img
                  :src="getStudentImage(testimonial.image)"
                  :alt="testimonial.name"
                  class="student-avatar"
                />
              </div>
            </div>
          </transition-group>
        </div>

        <!-- Активний відгук -->
        <div class="testimonial-content" :key="selectedIndex">
          <h3 class="student-name">{{ activeTestimonial.name }}</h3>
          <div class="testimonial-quote">
            <div class="quote-icon quote-left">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 8c-3.3 0-6 2.7-6 6 0 1.5.6 3.1 1.4 4.2L1 22h6c3.3 0 6-2.7 6-6V8h-3zm16 0c-3.3 0-6 2.7-6 6 0 1.5.6 3.1 1.4 4.2L17 22h6c3.3 0 6-2.7 6-6V8h-3z"
                  fill="#ccc"
                />
              </svg>
            </div>

            <p class="testimonial-text">{{ activeTestimonial.text }}</p>

            <div class="quote-icon quote-right">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 24c3.3 0 6-2.7 6-6 0-1.5-.6-3.1-1.4-4.2L31 10h-6c-3.3 0-6 2.7-6 6v8h3zm-16 0c3.3 0 6-2.7 6-6 0-1.5-.6-3.1-1.4-4.2L15 10H9c-3.3 0-6 2.7-6 6v8h3z"
                  fill="#ccc"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Декоративні елементи -->
    <div class="decorative-elements">
      <div class="decoration decoration-1">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,10 20,90 80,90" fill="#7C4DFF" opacity="0.6" />
        </svg>
      </div>

      <div class="decoration decoration-2">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="60" height="60" rx="10" fill="#2196F3" opacity="0.4" />
        </svg>
      </div>

      <div class="decoration decoration-3">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M10,50 Q30,10 50,50 T90,50" stroke="#FFD963" stroke-width="4" fill="none" />
        </svg>
      </div>

      <div class="decoration decoration-4">
        <div class="circle-decoration"></div>
      </div>

      <div class="decoration decoration-5">
        <div class="circle-decoration small"></div>
      </div>
    </div>
  </section>
</template>

<script>
// Імпортуємо зображення студентів
import testimonial1 from '@/assets/img/testomial-1.png'
import testimonial2 from '@/assets/img/testomial-2.png'
import testimonial3 from '@/assets/img/testomial-3.png'

export default {
  name: 'OurTestomonials',
  data() {
    return {
      selectedIndex: 1, // За замовчуванням середній студент активний
      isTransitioning: false, // Флаг для контролю анімації
      testimonials: [
        {
          id: 1,
          name: 'Anna Kowalski',
          image: 'testomial-1.png',
          text: 'Будучи студентом цього веб-сайту онлайн-освіти, я можу впевнено сказати, що це був неймовірний досвід. Платформа зручна для користувачів, а курси добре структуровані, що полегшує мені навчання.',
        },
        {
          id: 2,
          name: 'William Smith',
          image: 'testomial-2.png',
          text: 'Будучи студентом цього веб-сайту онлайн-освіти, я можу впевнено сказати, що це був неймовірний досвід. Платформа зручна для користувачів, а курси добре структуровані, що полегшує мені навчання у власному темпі.',
        },
        {
          id: 3,
          name: 'Maria Garcia',
          image: 'testomial-3.png',
          text: 'Будучи студентом цього веб-сайту онлайн-освіти, я можу впевнено сказати, що це був неймовірний досвід. Платформа зручна для користувачів, а курси добре структуровані.',
        },
      ],
    }
  },
  computed: {
    activeTestimonial() {
      return this.testimonials[this.selectedIndex] || this.testimonials[1]
    },
    reorderedTestimonials() {
      // Переставляємо масив так, щоб активний елемент був посередині
      const testimonials = [...this.testimonials]
      const activeItem = testimonials[this.selectedIndex]
      const otherItems = testimonials.filter((_, index) => index !== this.selectedIndex)

      if (otherItems.length === 2) {
        return [otherItems[0], activeItem, otherItems[1]]
      } else if (otherItems.length === 1) {
        return [otherItems[0], activeItem]
      } else {
        return [activeItem]
      }
    },
  },
  methods: {
    selectTestimonial(index) {
      if (this.isTransitioning || this.selectedIndex === index) return

      this.isTransitioning = true

      // Додаємо плавну затримку для ефекту
      requestAnimationFrame(() => {
        this.selectedIndex = index

        // Дозволяємо наступну анімацію через 800ms
        setTimeout(() => {
          this.isTransitioning = false
        }, 800)
      })
    },
    getStudentImage(imageName) {
      // Мапінг імен файлів до імпортованих зображень
      const imageMap = {
        'testomial-1.png': testimonial1,
        'testomial-2.png': testimonial2,
        'testomial-3.png': testimonial3,
      }
      return imageMap[imageName] || testimonial2
    },
    isActive(testimonialId) {
      return this.testimonials[this.selectedIndex].id === testimonialId
    },
    getOriginalIndex(testimonialId) {
      return this.testimonials.findIndex((t) => t.id === testimonialId)
    },
  },
}
</script>

<style scoped>
.our-testomonials {
  background-color: var(--light-gray);
  padding: 5rem 0;
  position: relative;
  overflow: hidden;
}

/* Заголовок секції */
.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-subtitle {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--accent-orange);
  letter-spacing: 1px;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.section-title {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--text-color);
  margin: 0;
  line-height: 1.2;
}

/* Контейнер відгуків */
.testimonials-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

/* Аватари студентів */
.students-avatars {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;
  position: relative;
  overflow: visible;
  padding: 20px;
}

.avatars-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  position: relative;
  padding: 10px;
}

.avatar-wrapper {
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  padding: 10px;
}

.avatar-wrapper:not(.active) {
  opacity: 0.7;
  transform: scale(0.85);
}

.avatar-wrapper.active {
  transform: scale(1.1);
  z-index: 2;
}

.avatar-container {
  position: relative;
  border-radius: 50%;
  padding: 0;
  background: transparent;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-wrapper.active .avatar-container {
  box-shadow: 0 0 0 4px #ffd963;
}

.student-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: block;
}

.avatar-wrapper.active .student-avatar {
  width: 90px;
  height: 90px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Анімації переміщення */
.avatar-slide-move {
  transition: transform 0.8s cubic-bezier(0.2, 0, 0.2, 1);
}

.avatar-slide-enter-active {
  transition: all 0.8s cubic-bezier(0.2, 0, 0.2, 1);
}

.avatar-slide-leave-active {
  transition: all 0.8s cubic-bezier(0.2, 0, 0.2, 1);
  position: absolute;
}

.avatar-slide-enter-from {
  opacity: 0;
  transform: scale(0.5) translateY(-30px);
}

.avatar-slide-leave-to {
  opacity: 0;
  transform: scale(0.5) translateY(30px);
}

/* Контент відгуку */
.testimonial-content {
  text-align: center;
  position: relative;
}

.student-name {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 2rem;
  animation: fadeInUp 0.6s ease forwards;
}

.testimonial-quote {
  position: relative;
  background-color: transparent;
  padding: 2.5rem 3rem;
  border-radius: 16px;
  margin: 0 2rem;
  animation: fadeInUp 0.6s ease 0.2s forwards;
}

.quote-icon {
  position: absolute;
  width: 40px;
  height: 40px;
}

.quote-left {
  top: -20px;
  left: 30px;
}

.quote-right {
  bottom: -20px;
  right: 30px;
  transform: rotate(180deg);
}

.testimonial-text {
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-color);
  margin: 0;
  position: relative;
  z-index: 1;
}

/* Декоративні елементи */
.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration {
  position: absolute;
  opacity: 0.6;
}

.decoration-1 {
  top: 10%;
  left: 5%;
  width: 60px;
  height: 60px;
  animation: float 6s ease-in-out infinite;
}

.decoration-2 {
  top: 20%;
  right: 8%;
  width: 50px;
  height: 50px;
  animation: float 8s ease-in-out infinite reverse;
}

.decoration-3 {
  bottom: 25%;
  left: 10%;
  width: 80px;
  height: 40px;
  animation: float 7s ease-in-out infinite;
}

.decoration-4 {
  top: 60%;
  right: 5%;
  animation: float 5s ease-in-out infinite reverse;
}

.decoration-5 {
  bottom: 10%;
  right: 15%;
  animation: float 9s ease-in-out infinite;
}

.circle-decoration {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border-radius: 50%;
  opacity: 0.1;
}

.circle-decoration.small {
  width: 60px;
  height: 60px;
}

/* Анімації */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-15px) rotate(5deg);
  }
  50% {
    transform: translateY(-25px) rotate(0deg);
  }
  75% {
    transform: translateY(-10px) rotate(-5deg);
  }
}

/* Responsive стилі */
@media (max-width: 1024px) {
  .section-title {
    font-size: 2.2rem;
  }

  .students-avatars {
    gap: 1.5rem;
  }

  .testimonial-quote {
    margin: 0 1rem;
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .our-testomonials {
    padding: 3rem 0;
  }

  .section-header {
    margin-bottom: 2.5rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .students-avatars {
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .avatar-wrapper.active .avatar-container {
    box-shadow: 0 0 0 3px #ffd963;
  }

  .student-avatar {
    width: 60px;
    height: 60px;
  }

  .avatar-wrapper.active .student-avatar {
    width: 70px;
    height: 70px;
  }

  .testimonial-quote {
    margin: 0 0.5rem;
    padding: 1.5rem;
  }

  .testimonial-text {
    font-size: 1rem;
  }

  .student-name {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .students-avatars {
    gap: 0.8rem;
  }

  .avatar-wrapper.active .avatar-container {
    box-shadow: 0 0 0 2px #ffd963;
  }

  .student-avatar {
    width: 50px;
    height: 50px;
  }

  .avatar-wrapper.active .student-avatar {
    width: 60px;
    height: 60px;
  }

  .testimonial-quote {
    padding: 1rem;
  }

  .testimonial-text {
    font-size: 0.9rem;
    line-height: 1.6;
  }
}
</style>
