<template>
  <div class="home-page">
    <!-- Секція зв'язку (над банером) -->
    <contact-us />

    <!-- Основний банер -->
    <main-home-banner />

    <!-- Статистика платформи -->
    <platform-statistic-info />
  </div>
</template>

<script>
import ContactUs from '@/components/home/ContactUs.vue'
import MainHomeBanner from '@/components/home/MainHomeBanner.vue'
import PlatformStatisticInfo from '@/components/home/PlatformStatisticInfo.vue'

export default {
  name: 'HomePage',
  components: {
    ContactUs,
    MainHomeBanner,
    PlatformStatisticInfo,
  },
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}
</style>
