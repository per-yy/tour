<script setup>
import Header from '@/components/Header.vue';
</script>

<template>
  <Header class="header"></Header>
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
