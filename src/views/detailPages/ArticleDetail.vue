<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getArticleByIdService } from '@/api/article';
import { followUserService, unFollowUserService } from '@/api/user';
import { sendCommentService } from '@/api/comment';
import { likeService, cancelLikeService } from '@/api/like';
import { collectService, cancelCollectService } from '@/api/collection';
import { useTokenStore } from '@/stores/token';
import { ElMessage } from 'element-plus';
import {
    ChatRound
} from '@element-plus/icons-vue';
//路由用于接收参数
const route = useRoute();

//用户判断用户是否登录
const tokenStore = useTokenStore();

//登录状态
const isLoggedIn = ref(false);

//是否是自己
const isSelf = ref(true);

//文章id
const articleId = ref();

//文章
const article = ref({
    id: 0,
    user: {
        id: "",
        username: "",
        password: "",
        email: "",
        createTime: null,
        url: ""
    },
    title: "",
    content: "",
    url: "",
    province: "北京",
    likes: 123,
    collection: 100,
    comment: 100,
    commentContent: [],
    isCollected: 0,
    isFollowed: 0,
    isLiked: 1
})

//用于发送评论
const comment = ref({
    user: {
        username: '',
        url: ''
    },
    content: '',
    articleId: ''
});

const commentContent = ref('');

const getArticle = async () => {
    //获取文章id
    articleId.value = route.params.articleId;
    let result = await getArticleByIdService(articleId.value);
    if (result.code === 1) {
        article.value = result.data;
        //解析json
        try {
            const jsonObject = JSON.parse(article.value.content);
            article.value.content = jsonObject.content;
        } catch (error) {
            console.error("无效的 JSON 字符串", error);
        }
    }
    else {
        ElMessage.error(result.msg);
    }
}

//初始化收藏喜欢图标
const initIcon = (data) => {
    data.collectionIconClass = data.isCollected === 1 ? 'icon-star-full' : 'icon-star';
    data.likeIconClass = data.isLiked === 1 ? 'icon-hear-full' : 'icon-hear';

}

//修改喜欢图标
const changeLikeIcon = async () => {
    if (!isLoggedIn) {
        ElMessage.error("请先登录")
    } else if (article.value.isLiked === 1) {
        //修改成功则改样式及数量
        if (await cancelLike(article.value.id)) {
            article.value.isLiked = 0;
            article.value.likeIconClass = 'icon-hear';
            article.value.likes--;
        }
    } else {
        if (await like(article.value.id)) {
            article.value.isLiked = 1;
            article.value.likeIconClass = 'icon-hear-full';
            article.value.likes++;
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
const changeCollectionIcon = async () => {
    if (!isLoggedIn) {
        ElMessage.error("请先登录")
    } else if (article.value.isCollected === 1) {
        //修改成功则改样式及数量
        if (await cancelCollect(article.value.id)) {
            article.value.isCollected = 0;
            article.value.collectionIconClass = 'icon-star';
            article.value.collection--;
        }
    } else {
        if (await collect(article.value.id)) {
            article.value.isCollected = 1;
            article.value.collectionIconClass = 'icon-star-full';
            article.value.collection++;
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


//关注和取消关注操作
const changeFollowState = async () => {
    if (article.value.isFollowed === 1) {
        //已关注说明已经登录 不用判断
        let result = await unFollowUserService(article.value.user.id);
        if (result.code === 1) {
            article.value.isFollowed = 0;
        } else {
            ElMessage.error(result.msg);
        }
    } else {
        //判断用户是否登录
        if (!isLoggedIn) {
            ElMessage.error('请先登录')
        } else {
            let result = await followUserService(article.value.user.id);
            if (result.code === 1) {
                article.value.isFollowed = 1;
            } else {
                ElMessage.error(result.msg);
            }
        }
    }
}

//发送评论
const sendComment = async () => {
    comment.value.content = commentContent.value;
    let result = await sendCommentService(comment.value);
    if (result.code === 1) {
        //评论
        article.value.commentContent.unshift(comment.value);
        ElMessage.success('评论成功')
    } else {
        ElMessage.error(result.msg);
    }
}

//插入html
const insertHTML = () => {
    let targetElement = document.getElementById('articleContent');
    targetElement.innerHTML = targetElement.innerHTML + article.value.content;
}


//初始化一些数据 例如评论之类
const initData = () => {
    isLoggedIn.value = tokenStore.token.jwt === '' ? false : true;
    isSelf.value = tokenStore.token.email === article.value.user.email ? true : false;
    comment.value.user.username = tokenStore.token.username;
    comment.value.user.url = tokenStore.token.url;
    comment.value.articleId = article.value.id;
}

onBeforeMount(async () => {
    await getArticle();
    insertHTML();
    initData();
    initIcon(article.value);
})
</script>

<template>
    <main>
        <div class="user">
            <div>
                <img :src="article.user.url" alt="">
                <span>{{ article.user.username }}</span>
            </div>
            <el-button v-if="!isSelf" :type="article.isFollowed ? 'info' : 'success'" @click="changeFollowState()">
                <span v-if="article.isFollowed">已关注</span>
                <span v-else>关注</span>
            </el-button>
        </div>
        <div class="article">
            <!-- 标题 -->
            <h1>{{ article.title }}</h1>
            <!-- 内容 在这插入HTML -->
            <div id="articleContent"></div>
            <!-- 文章页脚 -->
            <div style="display: flex;justify-content: center;">
                <div class="contentItem" @click="changeLikeIcon()">
                    <span :class="['iconfont', article.likeIconClass]"></span>
                    <span>{{ article.likes }}</span>
                </div>
                <div class="contentItem" @click="changeCollectionIcon()">
                    <span :class="['iconfont', article.collectionIconClass]"></span>
                    <span>{{ article.collection }}</span>
                </div>
                <div class="contentItem">
                    <el-icon>
                        <ChatRound />
                    </el-icon>
                    <span>{{ article.comment }}</span>
                </div>
            </div>
        </div>
        <!-- 根据登录状态不同展示 -->
        <div class="sendComment">
            <img :src="article.user.url" alt="" v-if="isLoggedIn">
            <el-input autosize type="textarea" placeholder="评论一下叭" v-model="commentContent"
                :disabled="!isLoggedIn"></el-input>
            <el-button @click="sendComment()" :disabled="!isLoggedIn">{{ isLoggedIn ? '发送' : '请先登录' }}</el-button>
        </div>
        <div class="comment">
            <div class="commentItem" v-for="(item, index) in article.commentContent" :key="index">
                <div>
                    <img :src="item.user.url" alt="">
                    <span>{{ item.user.username }}</span>
                </div>
                <span style=" word-wrap: break-word;">{{ item.content }}</span>
            </div>
        </div>
    </main>
</template>

<style scoped>
main {
    width: 900px;
    margin: 0 auto;
    margin-top: 65px;
    border-radius: 5px;
    padding: 20px;
    box-shadow: 0px 0 5px 0 rgba(0, 0, 0, 0.2);
    background-color: rgb(246, 248, 249);
}

.user {
    display: flex;
    align-items: center;
}

.user div {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.user img {
    display: block;
    width: 50px;
    height: 50px;
    border-radius: 50%;
}

.user .el-button {
    margin-left: 75%;
    width: 80px;
}

#articleContent p img {
    display: inline !important;
    max-width: 100%;
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

.sendComment {
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
    margin-top: 10px;
    border: 1px solid rgb(191, 186, 186);
}

.sendComment .el-textarea {
    margin: 10px;
}


.sendComment img {
    width: 35px;
    height: 35px;
    border-radius: 5px;
}

.comment {
    padding: 20px;
    border-radius: 3px;
    border: 1px solid rgb(191, 186, 186);
}

.commentItem {
    margin-top: 10px;
}

.commentItem div {
    width: fit-content;
    display: flex;
    align-items: center;
}

.commentItem div span {
    margin-left: 10px;
}

.commentItem span {
    margin-top: 5px;
}

.commentItem img {
    width: 25px;
    height: 25px;
    border-radius: 4px;
}
</style>