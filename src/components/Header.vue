<script lang="ts" setup>
</script>

<template>
    <header>
        <div class="logo"><img src="../../public/logo/logo-tuji.png" alt=""></div>
        <el-menu class="nav" mode="horizontal" router default-active="/" active-text-color="#24BD51" >
            <el-menu-item class="menu-item" index="/">首页</el-menu-item>
            <el-menu-item class="menu-item" index="/scenicSpot">景点</el-menu-item>
            <el-menu-item class="menu-item" index="/follow">关注</el-menu-item>
        </el-menu>
        <div class="avatar">
            <el-button class="btn" type="success">登录</el-button>
            <el-button class="btn" type="info" plain>注册</el-button>
        </div>
    </header>

</template>

<style scoped>
header {
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.2);
    background-color: white;
}

.logo img {
    height: 50px;
    margin: 0;
}

.nav {
    width: 320px;
    margin-left: 5%;
    border-bottom: none;
    font-weight: bold;
    font-size: xx-small;
}

.menu-item {
    font-size: 20px;
}

.menu-item:hover{
    color:#24BD51 !important;
}

.avatar {
    margin-left: 7%;
}

.btn {
    font-size: medium;
    height: 40px;
    width: 80px;
}
</style>