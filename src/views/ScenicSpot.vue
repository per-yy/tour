<script setup>
import * as echarts from "echarts";
import { ref, onMounted, onBeforeUnmount, onBeforeMount } from "vue";
import { getScenicSpotService } from "@/api/scenicSpot.js";
import { likeScenicSpotService, cancelLikeScenicSpotService } from "@/api/like";
import { useTokenStore } from '@/stores/token';
import router from "@/router";
import LoadingVue from '@/components/Loading.vue';
import china from "../json/china.json";
import {
    Search,
    Location
} from '@element-plus/icons-vue';
//用户信息
const tokenStore = useTokenStore();

//加载状态变量
const loading = ref(false);

//景点是否查询完
const scenicSpotIsEnd = ref(false);

//次级导航索引
const scenicSpotIndex = ref(1);

//景点查询DTO
const scenicSpotPageQueryDTO = ref({
    page: 1,
    pageSize: 6,
    condition: '',
    searchBy: 'new'
})

//景点
const scenicSpots = ref([]);

//绘制地图
const initMap = () => {
    let mapDom = document.getElementById("map");
    let mapChart = echarts.init(mapDom);
    // 初始化地图数据  
    echarts.registerMap("china", china);
    mapChart.setOption({
        //hover时显示的提示
        // tooltip: {
        //     trigger: "item",
        //     formatter: "{b}<br/>{c} 111(p / km2)",
        // },
        //左下角显示的东西
        // visualMap: {
        //     type: "piecewise",
        //     pieces: [{ color: "red" }],
        // },
        series: [
            {
                name: "中国",
                type: "map",
                map: "china",
                label: {
                    // 省份的名称是否显示  
                    show: false,
                    // 字体颜色 
                    color: "#fff",
                    // 字体大小  
                    fontSize: 12,
                },
                data: [],
                itemStyle: {
                    normal: {
                        borderColor: "rgba(255, 255, 255, 0.4)",
                        areaColor: "#13B806",
                        borderWidth: 1,
                        // 虚化程度  
                        shadowBlur: 1,
                        //边框颜色
                        shadowColor: "rgba(189,243,249)",
                    },
                    emphasis: {
                        show: false,
                        // 每个区域的颜色  
                        // 鼠标滑过颜色  
                        areaColor: "#ED806E",
                        // 鼠标滑过边框颜色  
                        shadowColor: "#995247",
                        // XY轴的偏移量  
                        shadowOffsetX: 1,
                        shadowOffsetY: 1,
                    },
                },
            },
        ],
    });
    // 添加点击事件监听
    mapChart.on('click', function (params) {
        // 调用处理函数，并传入省份名
        ProvinceClick(params.name);
    });
}

// 点击省份
const ProvinceClick = (provinceName) => {
    scenicSpotPageQueryDTO.value.condition = provinceName;
    searchScenicSpot();
}


//切换导航
const changeNav = (index) => {
    scenicSpotIndex.value = index;
    scenicSpotPageQueryDTO.value.searchBy = index === 1 ? 'new' : 'hot';
    searchScenicSpot();
}

//初始化喜欢图标
const initIcon = (data) => {
    for (let i = 0; i < data.length; i++) {
        data[i].likeIconClass = data[i].isLiked === 1 ? 'icon-hear-full' : 'icon-hear';
    }
}
//修改喜欢图标
const changeLikeIcon = async (index) => {
    if (tokenStore.token.jwt === '') {
        ElMessage.error("请先登录")
    } else if (scenicSpots.value[index].isLiked === 1) {
        //修改成功则改样式及数量
        if (await cancelLike(scenicSpots.value[index].id)) {
            scenicSpots.value[index].isLiked = 0;
            scenicSpots.value[index].likeIconClass = 'icon-hear';
            scenicSpots.value[index].likes--;
        }
    } else {
        if (await like(scenicSpots.value[index].id)) {
            scenicSpots.value[index].isLiked = 1;
            scenicSpots.value[index].likeIconClass = 'icon-hear-full';
            scenicSpots.value[index].likes++;
        }
    }
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

//初始化查询景点和搜索景点
const searchScenicSpot = async () => {
    scenicSpotPageQueryDTO.value.page = 1;
    scenicSpotIsEnd.value = false;
    let result = await getScenicSpotService(scenicSpotPageQueryDTO.value);
    if (result.code === 1) {
        initIcon(result.data);
        scenicSpots.value = result.data;
        scenicSpotPageQueryDTO.value.page++;
    } else {
        console.log(result.msg);
    }
}


//模拟延迟加载更多景点
const fetchMoreScenicSpot = () => {
    loading.value = true;
    setTimeout(async () => {
        // console.log('到底了');
        let result = await getScenicSpotService(scenicSpotPageQueryDTO.value);
        if (result.code === 1) {
            //景点查询完毕
            if (result.data.length < 6) {
                scenicSpotIsEnd.value = true;
            }
            initIcon(result.data);
            for (let i = 0; i < result.data.length; i++) {
                scenicSpots.value.push(result.data[i]);
            }
            scenicSpotPageQueryDTO.value.page += 1;
        } else {
            ElMessage.error("查询异常");
        }
        loading.value = false;
    }, 800);
};

//鼠标滚轮滑动查询
const handleScroll = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;
    if (scrollTop + windowHeight >= documentHeight && !loading.value && !scenicSpotIsEnd.value) {
        fetchMoreScenicSpot();
    }
};

onBeforeMount(async () => {
    window.addEventListener('scroll', handleScroll);
});

onMounted(async () => {
    initMap();
    await searchScenicSpot();
});

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
});

const goToScenicSpotDetail = (scenicSpotId) => {
    router.push({ name: 'ScenicSpotDetail', params: { scenicSpotId } });
}
</script>

<template>
    <!-- 加载效果 -->
    <LoadingVue v-if="loading == true"></LoadingVue>
    <el-scrollbar height="500px">
        <div id="map"></div>
    </el-scrollbar>
    <main>
        <!-- 二级导航 -->
        <header>
            <el-menu class="nav" mode="horizontal" default-active="1" active-text-color="#24BD51">
                <el-menu-item class="menu-item" index="1" @click="changeNav(1)">推荐</el-menu-item>
                <el-menu-item class="menu-item" index="2" @click="changeNav(2)">最热</el-menu-item>
            </el-menu>
            <el-input v-model="scenicSpotPageQueryDTO.condition" class="search_input" placeholder="搜索你感兴趣的地方"
                @keyup.enter="searchScenicSpot()" />
            <el-button class="search_btn" :icon="Search" @click="searchScenicSpot()" />
        </header>
        <!-- 景点列表 -->
        <div style="display: flex; justify-content: center; flex-wrap: wrap;">
            <div class="card" v-for="(scenicSpot, index) in scenicSpots" :key="index">
                <img :src="scenicSpot.url" alt="" @click="goToScenicSpotDetail(scenicSpot.id)">
                <br>
                <!-- 页脚 -->
                <div style="display: flex;justify-content: center;">
                    <div class="contentItem">
                        <span style="font-weight: 900;color:#A39206;">{{ scenicSpot.sceneRollCall }}</span>
                    </div>
                    <div class="contentItem">
                        <el-icon>
                            <Location />
                        </el-icon>
                        <span>{{ scenicSpot.provinceName }}</span>
                    </div>
                    <div class="contentItem" @click="changeLikeIcon(index)">
                        <span :class="['iconfont', scenicSpot.likeIconClass]"></span>
                        <span>{{ scenicSpot.likes }}</span>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <!-- 没有更多内容 -->
    <div class="end" v-if="scenicSpotIsEnd">没有更多景点</div>
</template>

<style scoped>
#map {
    height: 80vw;
    width: 99%;
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
    width: fit-content;
    height: fit-content;
    padding: 10px;
    border: 1px;
}

.card img {
    width: 310px;
    height: 220px;
    border-radius: 10px;
}

.contentItem {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
}

.contentItem span {
    margin-left: 5px;
}

.end {
    width: fit-content;
    margin: 0 auto;
    color: rgb(76, 80, 83);
}
</style>