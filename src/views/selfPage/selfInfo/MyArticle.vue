<script setup>
import { getMyArticleService, deleteArticleService } from '@/api/article';
import { likeService, cancelLikeService } from '@/api/like';
import { collectService, cancelCollectService } from '@/api/collection';
import { onBeforeMount, ref } from 'vue';
import { parseJson } from '@/utils/parseJson';
import router from '@/router';
import { useTokenStore } from '@/stores/token';
import {
    Location,
    ChatRound,
    Delete
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const articles = ref([{}]);

const tokenStore = useTokenStore();

//删除文章时的提示
const deleteDialogVisible = ref(false);

//待删除的文章id
const articleIndexForDelete = ref();

//文章的文字内容
const text = ref([]);

//查询我的文章
const getMyArticle = async () => {
    let result = await getMyArticleService();
    articles.value = result.data;
    initIcon(articles.value);
    parseJson(articles.value);
    getText(articles.value);
}

//提取文本
const getText = (data) => {
    for (let i = 0; i < data.length; i++) {
        let content = data[i].content;
        let temp = '';
        let textLen = 118;
        for (let j = 0; j < content.length; j++) {
            if (content[j].type === 'text') {
                if (temp.length <= textLen) {
                    temp += content[j].value;
                    if (temp.length > textLen) {
                        temp = temp.slice(0, textLen) + '...'
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

//删除文章
const deleteArticle = () => {
    let result = deleteArticleService(articles.value[articleIndexForDelete.value].id);
    deleteDialogVisible.value = false;
    //删除文章列表中的文章
    articles.value.splice(articleIndexForDelete.value, 1);
    ElMessage.success('删除成功')
}

onBeforeMount(async () => {
    await getMyArticle();
})

const goToArticleDetail = (articleId) => {
    router.push({ name: 'ArticleDetail', params: { articleId } });
}
</script>

<template>
    <main>
        <!-- 文章列表 -->
        <div v-for="(article, index) in articles" :key="index" class="card">
            <!-- 文章封面 -->
            <img :src="article.url" alt="加载失败" class="article_img" @click="goToArticleDetail(article.id)">
            <div>
                <!-- 文章标题和内容 -->
                <div style="margin-left: 20px;" @click="goToArticleDetail(article.id)">
                    <h2 class="title" style="line-height: 0px;">{{ article.title }}</h2>
                    <p style="margin-top: 40px;">{{ text[index] }}</p>
                </div>
                <!-- 文章页脚 -->
                <div style="display: flex;justify-content: center;">
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
                    <div class="contentItem" @click="deleteDialogVisible = true; articleIndexForDelete = index">
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </div>
                </div>
            </div>
        </div>
    </main>
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
main {
    margin-top: 0px;
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