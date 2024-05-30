<script setup>

import { ref, onBeforeMount } from 'vue';
import { getFollowedArticleService } from '@/api/article';
import { getFollowedUsers } from '@/api/user';
import LoadingVue from '@/components/Loading.vue';
import { getText } from '@/utils/parseHTML';
import ArticleListVue from '@/components/ArticleList.vue';
import { useTokenStore } from '@/stores/token';

const tokenStore = useTokenStore();

//被选中的用户
const selectedUserIndex = ref(-1);

//文章
const articles = ref([]);

//关注的用户
const users = ref([]);

//加载状态变量
const loading = ref(false);

//文章是否查询完
const articleIsEnd = ref(false);

//查询传输数据
const articlePageQueryDTO = ref({
    page: 1,
    pageSize: 5,
    condition: '',
    searchBy: 'new'
})

//滚动条
const scrollbar = ref(null);

//查询用户
const searchUsers = async () => {
    let result = await getFollowedUsers();
    if (result.code === 1) {
        users.value = result.data;
    } else {
        console.log(result.msg);
    }
}

//初始化收藏喜欢图标
const initIcon = (data) => {
    for (let i = 0; i < data.length; i++) {
        data[i].collectionIconClass = data[i].isCollected === 1 ? 'icon-star-full' : 'icon-star';
        data[i].likeIconClass = data[i].isLiked === 1 ? 'icon-hear-full' : 'icon-hear';
    }
}

//初始化页面查询、切换用户时查询、搜索
const searchArticle = async () => {
    //清空页数
    articlePageQueryDTO.value.page = 1;
    articleIsEnd.value = false;
    let result = await getFollowedArticleService(articlePageQueryDTO.value);
    if (result.code === 1) {
        //文章查询完毕
        if (result.data.length < 5) {
            articleIsEnd.value = true;
        }
        initIcon(result.data);
        articles.value = result.data;
        articlePageQueryDTO.value.page += 1;
        getText(articles.value);
    } else {
        ElMessage.error("查询异常");
        console.log(result);
    }
}

//切换左侧用户并查询
const changeUser = (index) => {
    selectedUserIndex.value = index;
    //判断是否是全部用户
    if (index === -1) {
        articlePageQueryDTO.value.condition = '';
        searchArticle();
    } else {
        articlePageQueryDTO.value.condition = users.value[index].id;
        searchArticle();
    }

}

//模拟延迟加载更多文章
const fetchMoreArticles = () => {
    loading.value = true;
    setTimeout(async () => {
        // console.log('到底了');
        let result = await getFollowedArticleService(articlePageQueryDTO.value);
        if (result.code === 1) {
            //文章查询完毕
            if (result.data.length < 5) {
                articleIsEnd.value = true;
            }
            initIcon(result.data);
            for (let i = 0; i < result.data.length; i++) {
                articles.value.push(result.data[i]);
            }
            articlePageQueryDTO.value.page += 1;
            //提取文字
            getText(result.data);
        } else {
            ElMessage.error("查询异常");
        }
        loading.value = false;
    }, 800);
};

//鼠标滚轮滑动查询
const handleScroll = () => {
    const scrollbarHeight = scrollbar.value.$el.offsetHeight; // 滚动条的高度
    const scrollHeight = scrollbar.value.$el.firstChild.scrollHeight; // 内容的总高度
    const scrollTop = scrollbar.value.$el.firstChild.scrollTop; // 滚动条的位置
    if (scrollHeight - (scrollTop + scrollbarHeight) < 1 && !loading.value && !articleIsEnd.value) {
        fetchMoreArticles();
    }
};

onBeforeMount(async () => {
    await searchUsers();
    await searchArticle();
})

</script>

<template>
    <!-- 加载效果 -->
    <LoadingVue v-if="loading == true"></LoadingVue>
    <div v-if="tokenStore.token.jwt === ''" class="not-login"><span>你还没有登录</span></div>
    <div v-else style="display: flex;">
        <!-- 侧边栏 -->
        <el-scrollbar height="630px" style="width: 200px;">
            <el-menu default-active="0">
                <el-menu-item :class="['user-list', { 'selected-user': selectedUserIndex === -1 }]" index="-1"
                    @click="changeUser(-1)">
                    <span style="margin-left: 44px;">全部关注</span>
                </el-menu-item>
                <el-menu-item :class="['user-list', { 'selected-user': selectedUserIndex === i }]" :index="i"
                    v-for="(user, i) in users" :key="i" @click="changeUser(i)">
                    <img :src="user.url" alt="" style="width: 40px;height: 40px; border-radius: 50%;">
                    <span>{{ user.username }}</span>
                </el-menu-item>
            </el-menu>
        </el-scrollbar>

        <!-- 文章 -->
        <el-scrollbar ref="scrollbar" height="640px" style="margin: 0 auto 0; margin-left: 150px;"
            @scroll="handleScroll()">
            <main>
                <ArticleListVue :articles></ArticleListVue>
            </main>
            <!-- 没有更多内容 -->
            <div class="end" v-if="articleIsEnd">没有更多文章</div>
        </el-scrollbar>

    </div>
</template>

<style scoped>
.not-login{
    font-size: xx-large;
    width: fit-content;
    margin: 200px auto 0;
    color: rgb(208, 203, 196);
}

.user-list {
    background-color: rgb(231, 240, 238);
    margin: 5px;
    border-radius: 15px;
}

.user-list span {
    color: black;
    margin-left: 20px;
}

.selected-user {
    background-color: rgb(40, 201, 161);
}

main {
    width: 900px;
    border-radius: 3px;
    box-shadow: 0px 0 5px 0 rgba(0, 0, 0, 0.2);
    margin: 0 auto;
}

.end {
    width: fit-content;
    margin: 0 auto;
    color: rgb(76, 80, 83);
}
</style>