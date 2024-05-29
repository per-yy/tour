<script setup>
import { cancelCollectService, collectService } from '@/api/collection.js';
import { cancelLikeService, likeService } from '@/api/like.js';
import { useTokenStore } from '@/stores/token';
import { deleteArticleService } from '@/api/article';
import router from '@/router';
import { ref } from 'vue';
import { defineProps } from 'vue';
import { ElMessage } from 'element-plus';
import {
    Location,
    ChatRound,
    Delete
} from '@element-plus/icons-vue';
// 接收传递的 articles 数据
const props = defineProps({
    articles: {
        type: Array,
        required: true
    },
    isMyArticlePage: {
        type: Boolean,
        required: true
    }
});

//用户信息
const tokenStore = useTokenStore();

//删除文章时的提示
const deleteDialogVisible = ref(false);

//待删除的文章索引
const articleIndexForDelete = ref(0);

const goToArticleDetail = (articleId) => {
    router.push({ name: 'ArticleDetail', params: { articleId } });
}
//修改喜欢图标
const changeLikeIcon = async (index) => {
    if (tokenStore.token.jwt === '') {
        ElMessage.error("请先登录")
    } else if (props.articles[index].isLiked === 1) {
        //修改成功则改样式及数量
        if (await cancelLike(props.articles[index].id)) {
            props.articles[index].isLiked = 0;
            props.articles[index].likeIconClass = 'icon-hear';
            props.articles[index].likes--;
        }
    } else {
        if (await like(props.articles[index].id)) {
            props.articles[index].isLiked = 1;
            props.articles[index].likeIconClass = 'icon-hear-full';
            props.articles[index].likes++;
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
    } else if (props.articles[index].isCollected === 1) {
        //修改成功则改样式及数量
        if (await cancelCollect(props.articles[index].id)) {
            props.articles[index].isCollected = 0;
            props.articles[index].collectionIconClass = 'icon-star';
            props.articles[index].collection--;
        }
    } else {
        if (await collect(props.articles[index].id)) {
            props.articles[index].isCollected = 1;
            props.articles[index].collectionIconClass = 'icon-star-full';
            props.articles[index].collection++;
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
//删除文章
const deleteArticle = async () => {
    let result = await deleteArticleService(props.articles[articleIndexForDelete.value].id);
    deleteDialogVisible.value = false;
    //删除文章列表中的文章
    props.articles.splice(articleIndexForDelete.value, 1);
    ElMessage.success('删除成功')
}
</script>
<template>
    <!-- 文章列表 -->
    <div v-for="(article, index) in props.articles" :key="index" class="card">
        <!-- 文章封面 -->
        <img :src="article.url" alt="加载失败" class="article_img" @click="goToArticleDetail(article.id)">
        <div style="width: 500px;">
            <!-- 文章标题和内容 -->
            <div style="margin-left: 20px;height: 135px;" @click="goToArticleDetail(article.id)">
                <h2 class="title" style="line-height: 0;">{{ article.title }}</h2>
                <p style="margin-top: 40px;">{{ article.text }}</p>
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
                <!-- 在我的文章页面显示删除键 -->
                <div class="contentItem" v-if="isMyArticlePage"
                    @click="deleteDialogVisible = true; articleIndexForDelete = index">
                    <el-icon>
                        <Delete />
                    </el-icon>
                </div>
            </div>
        </div>
    </div>
    <!-- 删除文章时的确认提示 -->
    <el-dialog v-model="deleteDialogVisible" title="提示" width="20%" center align-center>
        <span>你确定要删除这篇文章吗</span>
        <template #footer>
            <div>
                <el-button @click="deleteDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="deleteArticle()">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>
<style scoped>
.card {
    display: flex;
    height: 200px;
    margin-bottom: 10px;
    margin-top: 10px;
    cursor: pointer;
}

h2 {
    color: rgb(91, 85, 85);
}

.card:hover {
    background-color: #eaf6f1;
    border-radius: 8px;
}

.card h2:hover {
    color: rgb(9, 154, 43);
}

.card p:hover {
    color: rgb(84, 91, 88);
}

.article_img {
    margin: 5px;
    border-radius: 5px;
    width: 342px;
    height: 180px;
    object-fit: cover;
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