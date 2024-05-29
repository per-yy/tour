<script setup>
import { getArticleService } from '@/api/article.js';
import {
    Search,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, onBeforeUnmount, onBeforeMount } from 'vue'
import LoadingVue from '@/components/Loading.vue';

import { getText } from '@/utils/parseHTML';
import { getBannerService } from '@/api/banner';
import ArticleListVue from '@/components/ArticleList.vue'

//加载状态变量
const loading = ref(false);

//次级导航索引
const articleIndex = ref(1);

//文章是否查询完
const articleIsEnd = ref(false);

//查询传输数据
const articlePageQueryDTO = ref({
    page: 1,
    pageSize: 5,
    condition: '',
    searchBy: 'new'
})

//轮播图
const banner = ref([])

//文章
const articles = ref([])

//查询轮播图
const getBanner = async () => {
    let result = await getBannerService();
    banner.value = result.data;
}

//初始化收藏喜欢图标
const initIcon = (data) => {
    for (let i = 0; i < data.length; i++) {
        data[i].collectionIconClass = data[i].isCollected === 1 ? 'icon-star-full' : 'icon-star';
        data[i].likeIconClass = data[i].isLiked === 1 ? 'icon-hear-full' : 'icon-hear';
    }
}

//初始化页面查询、切换导航时查询、搜索
const searchArticle = async () => {
    //清空页数
    articlePageQueryDTO.value.page = 1;
    articleIsEnd.value = false;
    let result = await getArticleService(articlePageQueryDTO.value);
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

//模拟延迟加载更多文章
const fetchMoreArticles = () => {
    loading.value = true;
    setTimeout(async () => {
        // console.log('到底了');
        let result = await getArticleService(articlePageQueryDTO.value);
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
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;
    if (scrollTop + windowHeight >= documentHeight-1 && !loading.value && !articleIsEnd.value) {
        fetchMoreArticles();
    }
};

//切换导航
const changeNav = (index) => {
    articleIndex.value = index;
    articlePageQueryDTO.value.searchBy = index === 1 ? 'new' : 'hot';
    searchArticle();
}
onBeforeMount(async () => {
    await getBanner();
    await searchArticle();
    window.addEventListener('scroll', handleScroll);
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
    <!-- 加载效果 -->
    <LoadingVue v-if="loading == true"></LoadingVue>
    <!-- 轮播图 -->
    <el-carousel height="450px">
        <el-carousel-item v-for="item in banner" :key="item.id">
            <img :src="item.url" alt="加载失败" class="banner_img">
        </el-carousel-item>
    </el-carousel>
    <main>
        <!-- 二级导航 -->
        <header>
            <el-menu class="nav" mode="horizontal" default-active="1" active-text-color="#24BD51">
                <el-menu-item class="menu-item" index="1" @click="changeNav(1)">最新</el-menu-item>
                <el-menu-item class="menu-item" index="2" @click="changeNav(2)">最热</el-menu-item>
            </el-menu>
            <el-input v-model="articlePageQueryDTO.condition" class="search_input" placeholder="搜索你感兴趣的地方"
                @keyup.enter="searchArticle()" />
            <el-button class="search_btn" :icon="Search" @click="searchArticle()" />
        </header>
        <ArticleListVue :articles></ArticleListVue>
    </main>
    <!-- 没有更多内容 -->
    <div class="end" v-if="articleIsEnd">没有更多文章</div>
</template>

<style scoped>
.banner_img {
    width: 100%;
}

main {
    width: 900px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 3px;
    box-shadow: 0px 0 5px 0 rgba(0, 0, 0, 0.2);
}

header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--el-menu-border-color);
}

.nav {
    width: 350px;
    border-bottom: none !important;
}


.search_input {
    height: 45px;
    width: 500px;
    margin-left: 100px;
}

.search_btn {
    height: 45px;
}

.end {
    width: fit-content;
    margin: 0 auto;
    color: rgb(76, 80, 83);
}
</style>

<style>
.menu-item:hover {
    color: #24BD51 !important;
}
</style>