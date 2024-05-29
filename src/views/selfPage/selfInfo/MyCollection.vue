<script setup>
import { getMyCollectArticleService } from '@/api/article';
import { getText } from '@/utils/parseHTML';
import { onBeforeMount, ref } from 'vue';
import ArticleListVue from '@/components/ArticleList.vue';


//收藏的文章
const articles = ref([]);

//查询我收藏的文章
const getMyCollectArticle = async() => {
    let result = await getMyCollectArticleService();
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

onBeforeMount(() => {
    getMyCollectArticle();
})

</script>

<template>
    <main>
        <ArticleListVue :articles></ArticleListVue>
    </main>
</template>
<style scoped>
main {
    margin-top: 0px;
}
</style>