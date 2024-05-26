<script setup>
import { useTokenStore } from '@/stores/token';

//token
const tokenStore = useTokenStore();

</script>
<template>
    <div class="content">
        <header>
            <div>
                <img :src="tokenStore.token.url" alt="">
                <span>{{ tokenStore.token.username }}</span>
            </div>
            <div class="button">
                <el-button>修改资料</el-button>
                <el-button>退出登录</el-button>
            </div>
        </header>
        <main>
            
        </main>
    </div>

</template>
<style scoped>
.content {
    width: 900px;
    padding: 20px;
    background-color: antiquewhite;
    margin: 0 auto;
}

header{
    display: flex;
    align-items: center;
}

header div{
    width:fit-content;
    display: flex;
    align-items: center;
}

header div img {
    height: 100px;
    width: 100px;
    border-radius: 5px;
}

header div span{
    margin-left: 20px;
    font-size:30px;
    font-weight:800
}

header .button{
    margin-left:60%;
}
</style>