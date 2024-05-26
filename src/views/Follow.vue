<script setup>
import { useTokenStore } from '@/stores/token';
import { ref, onBeforeMount } from 'vue';
import { getFollowedArticleService } from '@/api/article';
import { getFollowedUsers } from '@/api/user';
import { cancelLikeService, likeService } from '@/api/like.js';
import { cancelCollectService, collectService } from '@/api/collection.js';
import LoadingVue from '@/components/Loading.vue';
//用户信息
const tokenStore = useTokenStore();

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

//文章的文字内容
const text = ref([]);

//滚动条
const scrollbar = ref(null);

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


//解析json
const parseJson = (data) => {
    for (let i = 0; i < data.length; i++) {
        try {
            const jsonObject = JSON.parse(data[i].content);
            // console.log(jsonObject);
            data[i].content = jsonObject.content;
            // console.log(data[i].content);
        } catch (error) {
            console.error("无效的 JSON 字符串", error);
        }
    }
}

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

//切换左侧用户并查询
const changeUser = (index) => {
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
    const scrollbarHeight = scrollbar.value.$el.offsetHeight; // 滚动条的高度
    const scrollHeight = scrollbar.value.$el.firstChild.scrollHeight; // 内容的总高度
    const scrollTop = scrollbar.value.$el.firstChild.scrollTop; // 滚动条的位置
    if (scrollHeight - (scrollTop + scrollbarHeight) < 1 && !loading.value && !articleIsEnd.value) {
        fetchMoreArticles();
    }
};

const goToArticleDetail = () => {
    router.push("/articleDetail");
}

onBeforeMount(async () => {
    await searchUsers();
    await searchArticle();
})

</script>

<template>
    <!-- 加载效果 -->
    <LoadingVue v-if="loading == true"></LoadingVue>
    <div style="display: flex;">
        <!-- 侧边栏 -->
        <el-scrollbar height="630px" style="width: 200px;">
            <el-menu default-active="0">
                <el-menu-item class="user-list" index="-1" @click="changeUser(-1)">
                    <span style="margin-left: 44px;">全部关注</span>
                </el-menu-item>
                <el-menu-item class="user-list" :index="i" v-for="(user, i) in users" :key="i" @click="changeUser(i)">
                    <img :src="user.url" alt="" style="width: 40px;height: 40px; border-radius: 50%;">
                    <span>{{ user.username }}</span>
                </el-menu-item>
            </el-menu>
        </el-scrollbar>

        <!-- 文章 -->
        <el-scrollbar ref="scrollbar" height="630px" style="margin: 60px auto 0; margin-left: 55px;" @scroll="handleScroll()">
            <main>
                <!-- 文章列表 -->
                <div v-for="(article, index) in articles" :key="index" class="card">
                    <!-- 文章封面 -->
                    <img :src="article.url" alt="加载失败" class="article_img" @click="goToArticleDetail()">
                    <div>
                        <!-- 文章标题和内容 -->
                        <div style="margin-left: 20px;" @click="goToArticleDetail()">
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
                                    <Location/>
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
                                    <ChatRound/>
                                </el-icon>
                                <span>{{ article.comment }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <!-- 没有更多内容 -->
            <div class="end" v-if="articleIsEnd">没有更多文章</div>
        </el-scrollbar>

    </div>
</template>

<style scoped>
.user-list{
    background-color: rgb(231, 240, 238);
    margin: 5px;
    border-radius: 15px;
}

.user-list span{
    color: black;
    margin-left: 20px;
}

main {
    width: 1000px;
    border-radius: 3px;
    box-shadow: 0px 0 5px 0 rgba(0, 0, 0, 0.2);
    margin: 0 auto;
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