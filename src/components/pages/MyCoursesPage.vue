<template>
  <div class="my-courses-page">
    <coming-soon feature="Мої курси" />
  </div>
</template>

<script>
import ComingSoon from '@/components/admin/ComingSoon.vue'

export default {
  name: 'MyCoursesPage',
  components: {
    ComingSoon,
  },
}
</script>

<style scoped>
.my-courses-page {
  min-height: calc(100vh - 140px);
}
</style>
