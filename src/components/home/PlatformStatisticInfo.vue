<template>
  <section class="platform-statistics">
    <div class="container">
      <div class="statistics-content">
        <div v-for="(stat, index) in statistics" :key="index" class="stat-item">
          <div class="stat-number">
            {{ stat.number }}<span v-if="stat.suffix" class="number-suffix">{{ stat.suffix }}</span>
          </div>
          <p class="stat-description">{{ stat.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PlatformStatisticInfo',
  data() {
    return {
      statistics: [
        {
          number: '120',
          description: 'Досвідчених викладачів',
        },
        {
          number: '200000',
          suffix: '+',
          description: 'Годин навчання',
        },
        {
          number: '298',
          description: 'Уроків та курсів',
        },
        {
          number: '1300',
          suffix: '+',
          description: 'Студентів',
        },
      ],
    }
  },
}
</script>

<style scoped>
.platform-statistics {
  background-color: var(--primary-color);
  color: var(--white);
  padding: 2rem 0;
  position: relative;
}

.statistics-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  text-align: center;
  padding: 2rem 1rem;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.stat-number {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--white);
  line-height: 1;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.1rem;
}

.number-suffix {
  font-size: 2rem;
  color: var(--white);
}

.stat-description {
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-size: 1rem;
  color: var(--white);
  margin: 0;
  line-height: 1.4;
  opacity: 0.95;
}

/* Responsive стилі */
@media (max-width: 1024px) {
  .statistics-content {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-item:nth-child(2) {
    border-right: none;
  }

  .stat-item:nth-child(3) {
    border-left: 1px solid rgba(255, 255, 255, 0.2);
  }

  .stat-number {
    font-size: 2.2rem;
  }

  .number-suffix {
    font-size: 1.8rem;
  }
}

@media (max-width: 768px) {
  .platform-statistics {
    padding: 1.5rem 0;
  }

  .statistics-content {
    grid-template-columns: 1fr;
    border-left: none;
  }

  .stat-item {
    padding: 1.5rem 1rem;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .stat-item:last-child {
    border-bottom: none;
  }

  .stat-item:nth-child(3) {
    border-left: none;
  }

  .stat-number {
    font-size: 2rem;
  }

  .number-suffix {
    font-size: 1.5rem;
  }

  .stat-description {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .stat-item {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.8rem;
  }

  .number-suffix {
    font-size: 1.3rem;
  }

  .stat-description {
    font-size: 0.85rem;
  }
}
</style>
