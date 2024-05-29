<script setup>
import { getMyArticleService, deleteArticleService } from '@/api/article';
import { onBeforeMount, ref } from 'vue';
import ArticleListVue from '@/components/ArticleList.vue';
import { getText } from '@/utils/parseHTML';

const articles = ref([]);

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

onBeforeMount(async () => {
    await getMyArticle();
})


</script>

<template>
    <main>
        <ArticleListVue :articles :isMyArticlePage></ArticleListVue>
    </main>
</template>
<style scoped>
main {
    margin-top: 0px;
}
</style>