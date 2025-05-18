<template>
  <section class="main-banner">
    <div class="container">
      <div class="banner-content">
        <!-- Текстовий контент -->
        <div class="content-left">
          <div class="guarantee-badge">100% ГАРАНТІЯ ЗАДОВОЛЕННЯ</div>

          <h1 class="main-title">
            Знайдіть ваш ідеальний
            <span class="highlighted-text">
              курс
              <!-- Декоративна метелик -->
              <svg class="butterfly-icon" viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20,15 C15,10 5,8 8,18 C12,20 16,18 20,15 C24,18 28,20 32,18 C35,8 25,10 20,15 Z"
                  fill="#7C4DFF"
                  opacity="0.8"
                />
                <path d="M18,13 L22,13 M18,17 L22,17" stroke="#5E35B1" stroke-width="1" />
              </svg>
              <!-- Декоративна лінія -->
              <svg class="decorative-line" viewBox="0 0 180 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10,15 Q90,5 170,12"
                  stroke="#7C4DFF"
                  stroke-width="3"
                  fill="none"
                  stroke-linecap="round"
                />
              </svg>
            </span>
          </h1>

          <p class="subtitle">Навчіться сьогодні, щоб досягти успіху завтра.</p>

          <v-btn class="courses-btn" size="large" @click="goToCourses">
            <span class="btn-text">Переглянути курси</span>
            <v-icon right class="btn-icon">mdi-arrow-right</v-icon>
          </v-btn>
        </div>

        <!-- Візуальний контент -->
        <div class="content-right">
          <div class="images-container">
            <!-- Великі декоративні фони -->
            <div class="large-bg-shapes">
              <div class="large-bg-circle blue-circle"></div>
              <div class="large-bg-circle gray-circle"></div>
              <div class="large-bg-shape yellow-shape"></div>
            </div>

            <!-- Сітка студентів 2x2 -->
            <div class="students-grid">
              <!-- Верхня лінія -->
              <div class="student-item">
                <img
                  src="@/assets/img/student-1.png"
                  alt="Студент з книгою"
                  class="student-image"
                />
              </div>

              <div class="student-item">
                <img
                  src="@/assets/img/student-2.png"
                  alt="Студент з дипломом"
                  class="student-image"
                />
              </div>

              <!-- Нижня лінія -->
              <div class="student-item">
                <img
                  src="@/assets/img/student-3.png"
                  alt="Студент з ноутбуком"
                  class="student-image"
                />
              </div>

              <div class="student-item">
                <img
                  src="@/assets/img/student-4.png"
                  alt="Студентка з сертифікатом"
                  class="student-image"
                />
              </div>
            </div>

            <!-- Малі декоративні елементи -->
            <div class="small-decorations">
              <!-- Фіолетовий трикутник -->
              <div class="decoration triangle-purple"></div>
              <!-- Синя фігура -->
              <div class="decoration shape-blue"></div>
              <!-- Хвиляста лінія -->
              <svg class="wavy-line" viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10,20 Q30,10 50,20 T90,20"
                  stroke="#7C4DFF"
                  stroke-width="3"
                  fill="none"
                  stroke-linecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Фонові декоративні елементи -->
    <div class="background-decorations">
      <div class="bg-shape bg-shape-yellow"></div>
      <div class="bg-shape bg-shape-purple"></div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'MainHomeBanner',
  methods: {
    goToCourses() {
      this.$router.push('/courses')
    },
  },
}
</script>

<style scoped>
.main-banner {
  position: relative;
  background: linear-gradient(135deg, #f4f5ff 0%, #ffffff 100%);
  min-height: 70vh;
  padding: 4rem 0;
  overflow: hidden;
}

.banner-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
  position: relative;
  z-index: 2;
}

/* Ліва частина - текст */
.content-left {
  max-width: 500px;
}

.guarantee-badge {
  display: inline-block;
  background-color: transparent;
  color: var(--accent-orange);
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 12px;
  font-weight: bold;
  padding: 8px 0;
  margin-bottom: 1.5rem;
  letter-spacing: 0.5px;
}

.main-title {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 3rem;
  font-weight: bold;
  color: var(--text-color);
  line-height: 1.2;
  margin-bottom: 1rem;
}

.highlighted-text {
  color: var(--text-color);
  position: relative;
  display: inline-block;
}

.butterfly-icon {
  position: absolute;
  top: -15px;
  right: -35px;
  width: 30px;
  height: 25px;
  animation: flutter 3s ease-in-out infinite;
}

.decorative-line {
  position: absolute;
  bottom: -15px;
  left: -10px;
  width: 180px;
  height: 20px;
  z-index: -1;
}

.subtitle {
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-size: 1.25rem;
  color: var(--secondary-text-color);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.courses-btn {
  background-color: #ffd963 !important;
  color: var(--text-color) !important;
  font-family: 'VinnytsiaSansBold', sans-serif;
  text-transform: none;
  letter-spacing: 0;
  border-radius: 25px !important;
  padding: 0 32px;
  height: 56px;
  box-shadow: 0 4px 12px rgba(255, 217, 99, 0.3);
  transition: all 0.3s ease;
}

.courses-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 217, 99, 0.4);
  background-color: #ffd963 !important;
}

.btn-text {
  color: var(--text-color);
  font-weight: bold;
  margin-right: 8px;
}

.btn-icon {
  color: var(--text-color);
}

/* Права частина - зображення та декорації */
.content-right {
  position: relative;
  height: 500px;
}

.images-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Великі декоративні фони */
.large-bg-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.large-bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
}

.blue-circle {
  width: 280px;
  height: 280px;
  background: linear-gradient(135deg, #6eb5ff, #4285f4);
  top: -20px;
  left: -40px;
}

.gray-circle {
  width: 240px;
  height: 240px;
  background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
  bottom: -20px;
  right: -40px;
}

.large-bg-shape {
  position: absolute;
  opacity: 0.1;
}

.yellow-shape {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #ffd963, #ffb300);
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  top: 50%;
  right: 20%;
  transform: translateY(-50%);
}

/* Сітка студентів */
.students-grid {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 15px;
  z-index: 3;
}

.student-item {
  width: 150px;
  height: 150px;
  border-radius: 20px;
  overflow: hidden;
  background: transparent;
  transition: transform 0.3s ease;
}

.student-item:hover {
  transform: scale(1.05);
}

.student-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: transparent;
}

/* Малі декоративні елементи */
.small-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.decoration {
  position: absolute;
}

.triangle-purple {
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 20px solid #7c4dff;
  top: 10%;
  right: 25%;
  opacity: 0.7;
  animation: float 4s ease-in-out infinite;
}

.shape-blue {
  width: 25px;
  height: 25px;
  background-color: #2196f3;
  border-radius: 5px;
  bottom: 20%;
  left: 15%;
  opacity: 0.6;
  animation: float 5s ease-in-out infinite reverse;
}

.wavy-line {
  position: absolute;
  bottom: 15%;
  left: 25%;
  width: 70px;
  height: 25px;
  opacity: 0.8;
}

/* Фонові декорації */
.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
}

.bg-shape-yellow {
  width: 120px;
  height: 120px;
  background-color: #ffd963;
  top: 20%;
  right: 5%;
  animation: float 8s ease-in-out infinite;
}

.bg-shape-purple {
  width: 80px;
  height: 80px;
  background-color: #7c4dff;
  bottom: 30%;
  left: 10%;
  animation: float 6s ease-in-out infinite reverse;
}

/* Анімації */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes flutter {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(-5deg) scale(1.1);
  }
  75% {
    transform: rotate(5deg) scale(0.9);
  }
}

/* Responsive стилі */
@media (max-width: 1024px) {
  .banner-content {
    gap: 1.5rem;
  }

  .main-title {
    font-size: 2.5rem;
  }

  .content-right {
    height: 400px;
  }

  .student-item {
    width: 110px;
    height: 110px;
  }

  .blue-circle {
    width: 240px;
    height: 240px;
  }

  .gray-circle {
    width: 200px;
    height: 200px;
  }
}

@media (max-width: 768px) {
  .main-banner {
    padding: 2rem 0;
    min-height: auto;
  }

  .banner-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .main-title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .content-right {
    height: 300px;
    order: -1;
  }

  .student-item {
    width: 90px;
    height: 90px;
  }

  .students-grid {
    gap: 10px;
  }

  .blue-circle {
    width: 200px;
    height: 200px;
  }

  .gray-circle {
    width: 170px;
    height: 170px;
  }
}

@media (max-width: 480px) {
  .student-item {
    width: 75px;
    height: 75px;
  }

  .students-grid {
    gap: 8px;
  }

  .triangle-purple {
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 14px solid #7c4dff;
  }

  .shape-blue {
    width: 20px;
    height: 20px;
  }
}
</style>
