<script setup>
import router from '@/router';
import { getArticleService } from '@/api/article.js';
import { cancelCollectService, collectService } from '@/api/collection.js';
import {
    Search,
    Location,
    ChatRound
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, onBeforeUnmount, onBeforeMount } from 'vue'
import LoadingVue from '@/components/Loading.vue';
import { useTokenStore } from '@/stores/token';
import { cancelLikeService, likeService } from '@/api/like.js';
import { parseJson } from '@/utils/parseJson';

//用户信息
const tokenStore = useTokenStore();

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

const banner = ref([
    "../../public/banner/huangshan.jpg",
    "../../public/banner/sanqingshan.jpg",
    "../../public/banner/songshan.jpeg",
])

//文章
const articles = ref([])

//文章的文字内容
const text = ref([]);

//提取文本
const getText = (data) => {
    for (let i = 0; i < data.length; i++) {
        let content = data[i].content;
        let temp = '';
        for (let j = 0; j < content.length; j++) {
            if (content[j].type === 'text') {
                if (temp.length <= 136) {
                    temp += content[j].value;
                    if (temp.length > 136) {
                        temp = temp.slice(0, 136) + '...'
                        break;
                    }
                }
            }
        }
        text.value.push(temp);
    }
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
        //将json解析为对象
        parseJson(result.data);
        initIcon(result.data);
        articles.value = result.data;
        articlePageQueryDTO.value.page += 1;
        text.value = [];
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
            parseJson(result.data);
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
    if (scrollTop + windowHeight >= documentHeight && !loading.value && !articleIsEnd.value) {
        fetchMoreArticles();
    }
};

//切换导航
const changeNav = (index) => {
    articleIndex.value = index;
    articlePageQueryDTO.value.searchBy = index === 1 ? 'new' : 'hot';
    searchArticle();
}

//修改喜欢图标
const changeLikeIcon = async (index) => {
    if (tokenStore.token.jwt === '') {
        ElMessage.error("请先登录")
    } else if (articles.value[index].isLiked === 1) {
        //修改成功则改样式及数量
        if (await cancelLike(articles.value[index].id)) {
            articles.value[index].isLiked = 0;
            articles.value[index].likeIconClass = 'icon-hear';
            articles.value[index].likes--;
        }
    } else {
        if (await like(articles.value[index].id)) {
            articles.value[index].isLiked = 1;
            articles.value[index].likeIconClass = 'icon-hear-full';
            articles.value[index].likes++;
        }
    }
}

//喜欢          
const like = async (id) => {
    let result = await likeService(id);
    if (result.code === 1) {
        return true;
    } else {
        ElMessage.error(result.msg);
        return false;
    }
}

//取消喜欢
const cancelLike = async (id) => {
    let result = await cancelLikeService(id);
    if (result.code === 1) {
        return true;
    } else {
        ElMessage.error(result.msg);
        return false;
    }
}

//修改收藏图标 调用接口
const changeCollectionIcon = async (index) => {
    if (tokenStore.token.jwt === '') {
        ElMessage.error("请先登录")
    } else if (articles.value[index].isCollected === 1) {
        //修改成功则改样式及数量
        if (await cancelCollect(articles.value[index].id)) {
            articles.value[index].isCollected = 0;
            articles.value[index].collectionIconClass = 'icon-star';
            articles.value[index].collection--;
        }
    } else {
        if (await collect(articles.value[index].id)) {
            articles.value[index].isCollected = 1;
            articles.value[index].collectionIconClass = 'icon-star-full';
            articles.value[index].collection++;
        }
    }
}

//收藏
const collect = async (id) => {
    let result = await collectService(id);
    if (result.code === 1) {
        return true;
    } else {
        ElMessage.error(result.msg);
        return false;
    }
}

//取消收藏接口
const cancelCollect = async (id) => {
    let result = await cancelCollectService(id);
    if (result.code === 1) {
        return true;
    } else {
        ElMessage.error(result.msg);
        return false;
    }
}

const goToArticleDetail = (articleId) => {
    // router.push("/articleDetail");
    router.push({ name: 'ArticleDetail', params: { articleId } });
}

onBeforeMount(async () => {
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
        <el-carousel-item v-for="item in banner" :key="item">
            <img :src="item" alt="加载失败" class="banner_img">
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
        <!-- 文章列表 -->
        <div v-for="(article, index) in articles" :key="index" class="card">
            <!-- 文章封面 -->
            <img :src="article.url" alt="加载失败" class="article_img" @click="goToArticleDetail(article.id)">
            <div>
                <!-- 文章标题和内容 -->
                <div style="margin-left: 20px;" @click="goToArticleDetail(article.id)">
                    <h2 class="title" style="line-height: 0;">{{ article.title }}</h2>
                    <p style="margin-top: 40px;">{{ text[index] }}</p>
                </div>
                <!-- 文章页脚 -->
                <div style="display: flex;justify-content: center;">
                    <div class="contentItem">
                        <img class="avatar" :src="article.user.url" alt="">
                        <span>{{ article.user.username }}</span>
                    </div>
                    <div class="contentItem">
                        <el-icon>
                            <Location />
                        </el-icon>
                        <span>{{ article.province }}</span>
                    </div>
                    <div class="contentItem" @click="changeCollectionIcon(index)">
                        <span :class="['iconfont', article.collectionIconClass]"></span>
                        <span>{{ article.collection }}</span>
                    </div>
                    <div class="contentItem" @click="changeLikeIcon(index)">
                        <span :class="['iconfont', article.likeIconClass]"></span>
                        <span>{{ article.likes }}</span>
                    </div>
                    <div class="contentItem">
                        <el-icon>
                            <ChatRound />
                        </el-icon>
                        <span>{{ article.comment }}</span>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <!-- 没有更多内容 -->
    <div class="end" v-if="articleIsEnd">没有更多文章</div>
</template>

<style scoped>
.banner_img {
    width: 100%;
}

main {
    width: 1000px;
    margin: 0 auto;
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

.menu-item:hover {
    color: #24BD51 !important;
}

.search_input {
    height: 45px;
    width: 500px;
    margin-left: 100px;
}

.search_btn {
    height: 45px;
}

.card {
    display: flex;
    height: 180px;
    margin-bottom: 10px;
    margin-top: 10px;
    cursor: pointer;
}

h2 {
    color: rgb(91, 85, 85);
}

.card:hover {
    background-color: #F8F8F8;
}

.card h2:hover {
    color: rgb(9, 154, 43);
}

.card p:hover {
    color: rgb(91, 84, 84);
}

.article_img {
    margin: 5px;
    border-radius: 5px;
}

.contentItem {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
}

.contentItem span {
    margin-left: 10px;
}

.avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
}

.end {
    width: fit-content;
    margin: 0 auto;
    color: rgb(76, 80, 83);
}
</style>