<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getScenicSpotByIdService } from '@/api/scenicSpot';
import { likeScenicSpotService, cancelLikeScenicSpotService } from '@/api/like';
import { useTokenStore } from '@/stores/token';
import { ElMessage } from 'element-plus';
import { getArticleService } from '@/api/article';
import ArticleListVue from '@/components/ArticleList.vue';
import { getText } from '@/utils/parseHTML';

//路由用于接收参数
const route = useRoute();

const tokenStore = useTokenStore();

//景点id
const scenicSpotId = ref();

//景点
const scenicSpot = ref({})

//查询传输数据
const articlePageQueryDTO = ref({
    page: 1,
    pageSize: 5,
    condition: '',
    searchBy: 'hot'
})

//相关文章
const relatedArticles = ref([])

//初始化数据
const initData = () => {
    scenicSpotId.value = route.params.scenicSpotId;
}

//初始化图标
const initScenicSpotIcon = () => {
    scenicSpot.value.likeIconClass = scenicSpot.value.isLiked === 1 ? 'icon-hear-full' : 'icon-hear';
}

//喜欢          
const like = async (id) => {
    let result = await likeScenicSpotService(id);
    if (result.code === 1) {
        return true;
    } else {
        ElMessage.error(result.msg);
        return false;
    }
}

//取消喜欢
const cancelLike = async (id) => {
    let result = await cancelLikeScenicSpotService(id);
    if (result.code === 1) {
        return true;
    } else {
        ElMessage.error(result.msg);
        return false;
    }
}

//点赞或取消点赞
const changeLikeIcon = async () => {
    if (tokenStore.token.jwt === '') {
        ElMessage.error("请先登录")
    } else if (scenicSpot.value.isLiked === 1) {
        //修改成功则改样式及数量
        if (await cancelLike(scenicSpot.value.id)) {
            scenicSpot.value.isLiked = 0;
            scenicSpot.value.likeIconClass = 'icon-hear';
            scenicSpot.value.likes--;
        }
    } else {
        if (await like(scenicSpot.value.id)) {
            scenicSpot.value.isLiked = 1;
            scenicSpot.value.likeIconClass = 'icon-hear-full';
            scenicSpot.value.likes++;
        }
    }
}

//查询景点
const getScenicSpot = async () => {
    let result = await getScenicSpotByIdService(scenicSpotId.value);
    if (result.code === 1) {
        scenicSpot.value = result.data;
    } else {
        ElMessage.error(result.msg);
    }
}

//查询相关文章
const getRelatedArticles = async () => {
    articlePageQueryDTO.value.condition = scenicSpot.value.sceneRollCall;
    //用分页查询查询相关文章
    let result = await getArticleService(articlePageQueryDTO.value);
    relatedArticles.value = result.data;
}

//初始文章的化收藏喜欢图标
const initIcon = (data) => {
    for (let i = 0; i < data.length; i++) {
        data[i].collectionIconClass = data[i].isCollected === 1 ? 'icon-star-full' : 'icon-star';
        data[i].likeIconClass = data[i].isLiked === 1 ? 'icon-hear-full' : 'icon-hear';
    }
}

onBeforeMount(async () => {
    initData();
    await getScenicSpot();
    initScenicSpotIcon();

    await getRelatedArticles();
    getText(relatedArticles.value);
    initIcon(relatedArticles.value);
})
</script>

<template>
    <div class="content">
        <video :src="scenicSpot.videoUrl" autoplay controls></video>
        <div class="describe">
            <div class="header-row">
                <h3>{{ scenicSpot.sceneRollCall }}</h3>
                <div class="contentItem" @click="changeLikeIcon()">
                    <span :class="['iconfont', scenicSpot.likeIconClass]"></span>
                    <span>{{ scenicSpot.likes }}</span>
                </div>
            </div>
            <span class="content-text">{{ scenicSpot.content }}</span>
        </div>
    </div>


    <div class="article">
        <span>相关文章</span>
        <hr>
        <span v-if="relatedArticles.length===0">无</span>
        <ArticleListVue :articles="relatedArticles"></ArticleListVue>
    </div>

</template>

<style scoped>
.content {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

video {
    display: block;
    margin-top: 30px;
    width: 900px;
    height: auto;
}

.describe {
    width: 900px;
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.iconfont {
    margin-right: 8px;
}

.article {
    width: 900px;
    margin: 0 auto;
}

</style>