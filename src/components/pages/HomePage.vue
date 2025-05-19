<template>
  <div class="home-page">
    <!-- Секція зв'язку (над банером) -->
    <contact-us />

    <!-- Основний банер -->
    <main-home-banner />

    <!-- Статистика платформи -->
    <platform-statistic-info />

    <!-- Переваги наших курсів -->
    <our-advantages />

    <!-- Категорії курсів -->
    <find-what-you-like />
  </div>
</template>

<script>
import ContactUs from '@/components/home/ContactUs.vue'
import MainHomeBanner from '@/components/home/MainHomeBanner.vue'
import PlatformStatisticInfo from '@/components/home/PlatformStatisticInfo.vue'
import OurAdvantages from '@/components/home/OurAdvantages.vue'
import FindWhatYouLike from '@/components/home/FindWhatYouLike.vue'

export default {
  name: 'HomePage',
  components: {
    ContactUs,
    MainHomeBanner,
    PlatformStatisticInfo,
    OurAdvantages,
    FindWhatYouLike,
  },
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}
</style>
