<template>
  <section class="our-advantages">
    <div class="container">
      <div class="advantages-header">
        <p class="section-subtitle">ЧОМУ ОБИРАЮТЬ НАС</p>
        <h2 class="section-title">Переваги наших курсів</h2>
      </div>

      <div class="advantages-grid">
        <div
          v-for="(advantage, index) in advantages"
          :key="index"
          class="advantage-card"
          @click="handleCardClick(advantage)"
        >
          <div class="icon-wrapper">
            <v-icon size="24" color="white">{{ advantage.icon }}</v-icon>
          </div>
          <div class="advantage-content">
            <h3 class="advantage-title">{{ advantage.title }}</h3>
            <p class="advantage-description">{{ advantage.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'OurAdvantages',
  data() {
    return {
      advantages: [
        {
          icon: 'mdi-headset',
          title: '24/7 Підтримка',
          description: 'Наш репетитор завжди може відповісти якомога швидше для вас.',
        },
        {
          icon: 'mdi-bookmark-multiple',
          title: 'Актуальні матеріали',
          description: 'Наша цифрова дошка оснащена функціями аудіо та відео чату',
        },
        {
          icon: 'mdi-currency-usd',
          title: 'Доступні ціни',
          description: 'Виберіть експерта-репетитора на основі вашого бюджету та години',
        },
        {
          icon: 'mdi-currency-usd',
          title: 'Доступні ціни',
          description: 'Виберіть експерта-репетитора на основі вашого бюджету та години',
        },
      ],
    }
  },
  methods: {
    handleCardClick(advantage) {
      console.log('Clicked advantage:', advantage.title)
      // Додаткова логіка при кліку на картку
    },
  },
}
</script>

<style scoped>
.our-advantages {
  background-color: var(--light-gray);
  padding: 5rem 0;
  position: relative;
}

.advantages-header {
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

/* Сітка переваг - 4 в рядок */
.advantages-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Картка переваги */
.advantage-card {
  background-color: var(--white);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.advantage-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.advantage-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(68, 59, 201, 0.12);
  border-color: rgba(68, 59, 201, 0.3);
}

.advantage-card:hover::before {
  transform: scaleX(1);
}

/* Іконка - прямокутна напівзакруглена */
.icon-wrapper {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.advantage-card:hover .icon-wrapper {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(68, 59, 201, 0.3);
}

/* Контент переваги */
.advantage-content {
  flex: 1;
}

.advantage-title {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.advantage-description {
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-size: 0.95rem;
  color: var(--secondary-text-color);
  line-height: 1.5;
  margin: 0;
}

/* Responsive стилі */
@media (max-width: 1200px) {
  .advantages-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem;
  }

  .section-title {
    font-size: 2.2rem;
  }
}

@media (max-width: 900px) {
  .advantages-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .advantage-card {
    padding: 1.5rem;
  }

  .icon-wrapper {
    width: 45px;
    height: 45px;
  }

  .advantage-title {
    font-size: 1.1rem;
  }

  .advantage-description {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .our-advantages {
    padding: 3rem 0;
  }

  .advantages-header {
    margin-bottom: 2.5rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .advantages-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .advantage-card {
    padding: 1.5rem;
  }

  .icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .advantage-title {
    font-size: 1.1rem;
  }

  .advantage-description {
    font-size: 0.85rem;
  }
}
</style>
