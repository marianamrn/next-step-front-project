<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <p class="copyright-text">© Захищено авторськими правами</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
}
</script>

<style scoped>
.app-footer {
  background-color: var(--primary-color);
  color: var(--white);
  padding: 2rem 0;
  margin-top: auto;
}

.footer-content {
  text-align: center;
}

.copyright-text {
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

/* Responsive стилі */
@media (max-width: 768px) {
  .app-footer {
    padding: 1.5rem 0;
  }

  .copyright-text {
    font-size: 13px;
  }
}
</style>
