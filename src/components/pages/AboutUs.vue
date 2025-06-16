<template>
  <div class="about-page">
    <!-- Hero секція -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Навчання — твій наступний крок</h1>
        <p class="hero-subtitle">NextStep — освітня платформа для навчання, викладання і зростання</p>
        <button class="cta-button">Приєднатися</button>
      </div>
      <div class="hero-animation">
        <l-ring size="60" color="#4CAF50"></l-ring>
      </div>
    </section>

    <!-- Місія та цінності -->
    <section class="mission-section">
      <h2>Що ми створюємо?</h2>
      <p class="mission-text">
        Ми створили NextStep, щоб об'єднати викладачів, студентів і компанії в одному цифровому просторі. 
        Платформа дозволяє створювати, продавати та проходити якісні онлайн-курси з будь-якої точки світу.
      </p>
      <div class="values-grid">
        <div class="value-card">
          <span class="value-icon">🎯</span>
          <h3>Доступність</h3>
          <p>Навчання для кожного</p>
        </div>
        <div class="value-card">
          <span class="value-icon">🚀</span>
          <h3>Якість</h3>
          <p>Сучасні формати, актуальний контент</p>
        </div>
        <div class="value-card">
          <span class="value-icon">🤝</span>
          <h3>Співпраця</h3>
          <p>Ми ростемо разом з нашими користувачами</p>
        </div>
      </div>
    </section>

    <!-- Як це працює -->
    <section class="how-it-works">
      <h2>Як це працює?</h2>
      <div class="steps-container">
        <div class="step">
          <div class="step-icon">
            <l-line-spinner size="40" color="#4CAF50"></l-line-spinner>
          </div>
          <h3>Створіть курс</h3>
        </div>
        <div class="step">
          <div class="step-icon">
            <l-line-spinner size="40" color="#4CAF50"></l-line-spinner>
          </div>
          <h3>Опублікуйте</h3>
        </div>
        <div class="step">
          <div class="step-icon">
            <l-line-spinner size="40" color="#4CAF50"></l-line-spinner>
          </div>
          <h3>Студенти проходять уроки</h3>
        </div>
        <div class="step">
          <div class="step-icon">
            <l-line-spinner size="40" color="#4CAF50"></l-line-spinner>
          </div>
          <h3>Отримуйте дохід / знання</h3>
        </div>
      </div>
    </section>

    <!-- Для кого NextStep -->
    <section class="for-whom">
      <h2>Для кого NextStep</h2>
      <div class="audience-grid">
        <div class="audience-card">
          <span class="audience-icon">👩‍🏫</span>
          <h3>Викладачі</h3>
          <p>Публікуйте курси та монетизуйте досвід</p>
        </div>
        <div class="audience-card">
          <span class="audience-icon">🧑‍🎓</span>
          <h3>Студенти</h3>
          <p>Вивчайте нові теми у зручному темпі</p>
        </div>
        <div class="audience-card">
          <span class="audience-icon">🏢</span>
          <h3>Компанії</h3>
          <p>Навчайте персонал централізовано</p>
        </div>
        <div class="audience-card">
          <span class="audience-icon">🎓</span>
          <h3>Заклади освіти</h3>
          <p>Інтегруйте систему у свій навчальний процес</p>
        </div>
      </div>
    </section>

    <!-- Статистика -->
    <section class="statistics">
      <div class="stat-item">
        <h3>100+</h3>
        <p>курсів</p>
      </div>
      <div class="stat-item">
        <h3>5 000+</h3>
        <p>студентів</p>
      </div>
      <div class="stat-item">
        <h3>300+</h3>
        <p>авторів</p>
      </div>
      <div class="stat-item">
        <h3>12</h3>
        <p>країн</p>
      </div>
    </section>

    <!-- Footer CTA -->
    <section class="footer-cta">
      <h2>Готові зробити наступний крок?</h2>
      <div class="cta-buttons">
        <button class="cta-button primary">Зареєструватися</button>
        <button class="cta-button secondary">Створити курс</button>
      </div>
    </section>
  </div>
</template>

<script>
import { ring, lineSpinner } from 'ldrs'

export default {
  name: 'AboutUs',
  mounted() {
    // Реєструємо веб-компоненти
    ring.register()
    lineSpinner.register()
  }
}
</script>

<style scoped>
.about-page {
  min-height: calc(100vh - 140px);
  color: #333;
}

/* Hero секція */
.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.hero-content {
  max-width: 600px;
}

.hero-title {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #34495e;
}

/* Місія та цінності */
.mission-section {
  padding: 4rem 2rem;
  text-align: center;
}

.mission-text {
  max-width: 800px;
  margin: 2rem auto;
  font-size: 1.2rem;
  line-height: 1.6;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.value-card {
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.value-card:hover {
  transform: translateY(-5px);
}

/* Як це працює */
.how-it-works {
  padding: 4rem 2rem;
  background: #f8f9fa;
}

.steps-container {
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
  flex-wrap: wrap;
}

.step {
  text-align: center;
  flex: 1;
  min-width: 200px;
  padding: 1rem;
}

/* Для кого NextStep */
.for-whom {
  padding: 4rem 2rem;
}

.audience-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.audience-card {
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.audience-card:hover {
  transform: translateY(-5px);
}

/* Статистика */
.statistics {
  display: flex;
  justify-content: space-around;
  padding: 4rem 2rem;
  background: #4CAF50;
  color: white;
}

.stat-item {
  text-align: center;
}

.stat-item h3 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

/* Footer CTA */
.footer-cta {
  padding: 4rem 2rem;
  text-align: center;
  background: #f8f9fa;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.cta-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cta-button.primary {
  background: #4CAF50;
  color: white;
}

.cta-button.secondary {
  background: white;
  color: #4CAF50;
  border: 2px solid #4CAF50;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Адаптивність */
@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .steps-container {
    flex-direction: column;
  }

  .statistics {
    flex-wrap: wrap;
  }

  .stat-item {
    width: 50%;
    margin-bottom: 2rem;
  }

  .cta-buttons {
    flex-direction: column;
  }
}
</style>
