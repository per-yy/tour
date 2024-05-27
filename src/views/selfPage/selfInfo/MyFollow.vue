<script setup>
import { getFollowedUserService } from '@/api/user';
import { followUserService, unFollowUserService } from '@/api/user';
import { onBeforeMount, onMounted, ref } from 'vue';

//关注的用户
const users = ref([]);

//查询关注的用户
const getFollowedUser = async () => {
    let result = await getFollowedUserService();
    users.value = result.data;
}

//初始化数据
const init = () => {
    for (let i = 0; i < users.value.length; i++) {
        users.value[i].isFollowed = 1;
    }
}

//改变关注状态
const changeFollowState = (index) => {
    if (users.value[index].isFollowed === 1) {
        let result = unFollowUserService(users.value[index].id);
        users.value[index].isFollowed = 0;
    } else {
        let result = followUserService(users.value[index].id);
        users.value[index].isFollowed = 1;
    }
}

onBeforeMount(async () => {
    await getFollowedUser();
    init();
})
</script>
<template>
    <main>
        <div class="user" v-for="(user, index) in users" :key="index">
            <div>
                <img :src="user.url" alt="">
                <span style="margin-bottom: 10px;">{{ user.username }}</span>
            </div>
            <el-button :type="user.isFollowed === 1 ? 'info' : 'success'" :plain="user.isFollowed === 1"
                @click="changeFollowState(index)">{{
                    user.isFollowed === 1 ? '取消关注' : '关注' }}</el-button>
        </div>
    </main>
</template>
<style scoped>
main {
    margin-top: 0px;
}

.user {
    margin: 20px;
    padding: 10px;
    border-bottom: 1px solid rgb(225, 218, 218);
}

.user div {
    display: flex;
    align-items: center;
}

.user img {
    width: 50px;
    height: 50px;
    border-radius: 5px;
}

.user span {
    margin-left: 10px;
}

.user .el-button {
    float: right;
    margin-right: 20px;
    margin-top: -50px;
    width: 90px;
}
</style>