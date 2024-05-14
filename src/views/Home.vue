<script setup>
import router from '@/router';
import { getArticleService } from '@/api/article.js';
import {
    Search,
    Location,
    ChatRound
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { onMounted, ref, onBeforeUnmount } from 'vue'
import LoadingVue from '@/components/Loading.vue';
// 初始喜欢图标
const likeIconClass = ref('icon-hear');
//初始收藏图标
const collectionIconClass = ref('icon-star');
//加载状态变量
const loading = ref(false);
//次级导航索引
const articleIndex = ref(1);


//查询传输数据
const ArticlePageQueryDTO = ref({
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

//提取出的文章文本
const articleContent=ref([]);

//文章
const articles = ref([
    {
        id: 1,
        user: {
            username: 'cz',
            url: '../../public/banner/huangshan.jpg'
        },
        title: '晋中三日访古行记',
        content: `{
        "content": [
        {
            "type": "text",
            "value": "This is some text before the image."
        },
        {
            "type": "image",
            "url": "https://example.com/images/my-image.jpg"
        },
        {
            "type": "text",
            "value": "This is some text after the image."
        }
        ]
        }`,
        url: '../../public/banner/huangshan.jpg',
        province: '北京',
        like: 99,
        collection: 999,
        comment: 0
    },

    // {
    //     id: 1,
    //     user: {
    //         username: 'cz',
    //         url: '../../public/banner/huangshan.jpg'
    //     },
    //     title: '晋中三日访古行记',
    //     content: '从连日的发烧头疼中解脱出来，很像是一个人在水下憋气了很久终于游到水面上透了口气，整个身体湿答答的，可是一身轻松。自从得过一次新冠后，咳嗽的毛病始终没好，去医院检查，医生说肺子没毛病，等天暖和就好了，然而这已是第二个暖和的春天，此后体质似乎大不如前，一点风吹草动不是引来发烧就是引来鼻塞或是更厉害的咳嗽。',
    //     url: '../../public/banner/huangshan.jpg',
    //     province: '北京',
    //     like: 99,
    //     collection: 999,
    //     comment: 10
    // },

])

//解析json
const parseJson = (data) => {
    for (let i = 0; i < data.value.length; i++) {
        try {
            const jsonObject = JSON.parse(data.value[i].content);
            data.value[i].content=jsonObject;
            console.log(data.value);
        } catch (error) {
            console.error("无效的 JSON 字符串", error);
        }
    }
}

//提取文本
const getText=()=>{
    
}

//初始化页面查询、切换导航时查询、搜索
const searchArticle = () => {
    let result = getArticleService(ArticlePageQueryDTO.value);
    if (result.code === 1) {
        parseJson(result.data);
        articles.value = result.data;
    } else {
        ElMessage.error("查询异常");
    }
}

//模拟延迟加载更多文章
const fetchMoreArticles = () => {
    loading.value = true;
    setTimeout(() => {
        console.log('到底了');
        // let result = getArticleService(ArticlePageQueryDTO.value);
        // if (result.code === 1) {
        //     articles.value.push(result.data);
        //     ArticlePageQueryDTO.value.page += 1;
        // } else {
        //     ElMessage.error("查询异常");
        // }
        loading.value = false;
    }, 800);

};

//鼠标滚轮滑动查询
const handleScroll = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 0.5 && !loading.value) {
        fetchMoreArticles();
    }
};

//切换导航
const changeNav = (index) => {
    articleIndex.value = index;
    ArticlePageQueryDTO.value.searchBy = index === 1 ? 'new' : 'hot';
    searchArticle();
}

//修改喜欢图标
const changeLikeIcon = () => {
    likeIconClass.value = likeIconClass.value === 'icon-hear' ? 'icon-hear-full' : 'icon-hear';
}

//修改收藏图标
const changeCollectionIcon = () => {
    collectionIconClass.value = collectionIconClass.value === 'icon-star' ? 'icon-star-full' : 'icon-star';
}

const goToArticleDetail = () => {
    router.push("/articleDetail");
}

onMounted(() => {
    searchArticle();
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
    <el-carousel height="450px" style="margin-top: 61px;">
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
            <el-input v-model="ArticlePageQueryDTO.condition" class="search_input" placeholder="搜索你感兴趣的地方"
                @keyup.enter="searchArticle()" />
            <el-button class="search_btn" :icon="Search" @click="searchArticle()" />
        </header>
        <!-- 文章列表 -->
        <div v-for="article in articles" :key="article.id" class="card">
            <!-- 文章封面 -->
            <img :src="article.url" alt="加载失败" class="article_img" @click="goToArticleDetail()">
            <div>
                <!-- 文章标题和内容 -->
                <div style="margin-left: 20px;" @click="goToArticleDetail()">
                    <h2 class="title" style="line-height: 0;">{{ article.title }}</h2>
                    <p style="margin-top: 30px;">{{ article.content }}</p>
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
                    <div class="contentItem" @click="changeCollectionIcon()">
                        <span :class="['iconfont', collectionIconClass]"></span>
                        <span>{{ article.collection }}</span>
                    </div>
                    <div class="contentItem" @click="changeLikeIcon()">
                        <span :class="['iconfont', likeIconClass]"></span>
                        <span>{{ article.like }}</span>
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
</style>