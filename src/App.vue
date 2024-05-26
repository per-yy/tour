<script setup>
import Header from '@/components/Header.vue';
</script>

<template>
  <Header class="header"></Header>
  <!-- 把页面挤下去 -->
  <div style="height: 61px;"></div>
  <router-view></router-view>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9;
}
</style>
