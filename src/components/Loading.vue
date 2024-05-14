<script setup>
</script>
<template>
    <div></div>
</template>
<style scoped>
div {
    height: 3px;
    width: 0;
    background-color: rgb(7, 223, 7);
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    animation: loading 0.3s;
    z-index: 99;
}

@keyframes loading {
    0% {
        width: 0;
    }

    100% {
        width: 100%;
    }
}
</style>