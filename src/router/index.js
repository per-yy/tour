// 导入 Vue Router 中的 createRouter 和 createWebHistory 函数
import { createRouter, createWebHistory } from 'vue-router';

// 导入页面组件
import HomeVue from '@/views/Home.vue';
import ScenicSpotVue from '@/views/ScenicSpot.vue';
import FollowVue from '@/views/Follow.vue';
import ArticleDetailVue from '@/views/detailPages/ArticleDetail.vue';
import ScenicSpotDetailVue from '@/views/detailPages/ScenicSpotDetail.vue';
import MyVue from "@/views/selfPage/My.vue"
import WriteArticleVue from '@/views/write/WriteArticle.vue'

// 定义路由关系
const routes = [
    { path: '/', component: HomeVue },
    { path: '/scenicSpot', component: ScenicSpotVue },
    { path: '/follow', component: FollowVue },
    { name: 'ArticleDetail', path: '/articleDetail/:articleId', component: ArticleDetailVue },
    { name: 'ScenicSpotDetail', path: '/scenicSpotDetail/:scenicSpotId', component: ScenicSpotDetailVue },
    { path: '/my', component: MyVue },
    { path: '/writeArticle', component: WriteArticleVue }
];

// 创建路由器
const router = createRouter({
    history: createWebHistory(),  // 使用 HTML5 history 模式的路由，需要服务器配置支持
    routes: routes                 // 将定义好的路由关系传递给路由器
});

// 导出路由，以便在其他地方使用
export default router;
