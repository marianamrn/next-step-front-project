<template>
  <div class="about-page">
    <coming-soon feature="Про нас" />
  </div>
</template>

<script>
import ComingSoon from '@/components/admin/ComingSoon.vue'

export default {
  name: 'AboutUs',
  components: {
    ComingSoon,
  },
}
</script>

<style scoped>
.about-page {
  min-height: calc(100vh - 140px);
}
</style>
