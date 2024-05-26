<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getScenicSpotByIdService } from '@/api/scenicSpot';
import { ElMessage } from 'element-plus';

//路由用于接收参数
const route = useRoute();

//景点id
const scenicSpotId = ref();

//景点
const scenicSpot = ref({})

//初始化数据
const initData = () => {
    scenicSpotId.value = route.params.scenicSpotId;
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

onBeforeMount(async () => {
    initData();
    await getScenicSpot();
})
</script>

<template>
    <div class="content">
        <el-carousel height="650px">
            <el-carousel-item v-for="(item, index) in scenicSpot" :key="index">
                <img :src="item.url" alt="">
            </el-carousel-item>
        </el-carousel>
    </div>
</template>

<style scoped>
.content{
    margin-top: 64px;
}
.content img{
    width: 100%;
    height: 650px;
}
</style>