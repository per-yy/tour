<script setup>
import { getMyArticleService, deleteArticleService } from '@/api/article';
import { onBeforeMount, ref } from 'vue';
import ArticleListVue from '@/components/ArticleList.vue';
import { ElMessage } from 'element-plus';
import { getText } from '@/utils/parseHTML';

const articles = ref([]);

//删除文章时的提示
const deleteDialogVisible = ref(false);

//待删除的文章id
const articleIndexForDelete = ref();

//在article list中判断
const isMyArticlePage=ref(true);

//查询我的文章
const getMyArticle = async () => {
    let result = await getMyArticleService();
    articles.value = result.data;
    initIcon(articles.value);
    getText(articles.value);
}

//初始化收藏喜欢图标
const initIcon = (data) => {
    for (let i = 0; i < data.length; i++) {
        data[i].collectionIconClass = data[i].isCollected === 1 ? 'icon-star-full' : 'icon-star';
        data[i].likeIconClass = data[i].isLiked === 1 ? 'icon-hear-full' : 'icon-hear';
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


</script>

<template>
    <main>
        <ArticleListVue :articles :isMyArticlePage></ArticleListVue>
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
</style>