<script setup>
import '@wangeditor/editor/dist/css/style.css';
import { onBeforeUnmount, ref, shallowRef, onBeforeMount } from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { uploadImgService } from '@/api/upload';
import { ElMessage } from 'element-plus';
import { getAllProvinceService } from '@/api/province';
import { getAllScenicSpotService } from '@/api/scenicSpot';
import { uploadArticleService } from '@/api/article';
import router from '@/router';


// 编辑器实例，必须用 shallowRef，重要！
const editorRef = shallowRef();

//工具栏配置
const toolbarConfig = {};
//排除一些工具栏选项
toolbarConfig.excludeKeys = [
    'fullScreen',//全屏
    'group-video',//视频
]
//编辑器配置
const editorConfig = {
    placeholder: '请输入内容...',
    MENU_CONF: {}
};

//检查图片
const checkImg = (file) => {
    //图片上传的类型
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp','image/webp'];
    if (!acceptedImageTypes.includes(file.type)) {
        ElMessage.error('图片格式错误')
        return false;
    } else if (file.size / 1024 / 1024 > 8) {
        ElMessage.error('图片不能大于8MB');
        return false;
    } return true;
}

//上传图片的进度
const uploadProcess = ref(0);

//上传文件的配置
editorConfig.MENU_CONF['uploadImage'] = {
    //自定义配置
    async customUpload(file, insertFn) {
        if (checkImg(file)) {
            uploadProcess.value = 0;
            let result = await uploadImgService(file, (progress) => {
                //上传进度
                uploadProcess.value = progress;
            });
            let url = result;
            let alt = '';
            let href = '';
            insertFn(url, alt, href);
        }
    }
    
}

//上传的文章
const article = ref({
    title: '',
    url: '',
    content: '',
    provinceId: '',
    scenicSpotId: ''
})

//省份列表
const province = ref([]);

//景点列表
const scenicSpot = ref([]);

//查询所有省份
const getAllProvince = async () => {
    let result = await getAllProvinceService();
    province.value = result.data;
}
onBeforeMount(async () => {
    await getAllProvince();
})

// 组件销毁时，也及时销毁编辑器，重要！
onBeforeUnmount(() => {
    const editor = editorRef.value;
    if (editor == null) return;
    editor.destroy();
});

// 编辑器回调函数
const handleCreated = (editor) => {
    // console.log('created', editor);
    editorRef.value = editor; // 记录 editor 实例，重要！
};

//允许粘贴
const customPaste = (editor, event, callback) => {
    // console.log('ClipboardEvent 粘贴事件对象', event);
    // 自定义插入内容
    // editor.insertText('xxx');

    // 返回值（注意，vue 事件的返回值，不能用 return）
    callback(true); // 返回 false ，阻止默认粘贴行为
    // callback(true) // 返回 true ，继续默认的粘贴行为
};

const beforeCoverImgUpload = (rawFile) => {
    if (!checkImg(rawFile)) {
        return false;
    }
    return true;
}
const uploadCoverImgSuccess = (response, uploadFile) => {
    article.value.url = response;
}

//选择省份时查询景点
const chooseProvince = async () => {
    let result = await getAllScenicSpotService(article.value.provinceId);
    scenicSpot.value = result.data;
    //清空景点信息
    article.value.scenicSpotId = '';
}

const uploadArticle = async () => {
    if (article.value.title === '') {
        ElMessage.warning('标题不能为空');
    } else if (article.value.url === '') {
        ElMessage.warning('请上传封面')
    } else {
        let result = await uploadArticleService(article.value);
        ElMessage.success('发布成功');
        router.push('/my/article');
    }
}
</script>

<template>
    <el-progress :percentage="uploadProcess" v-if="uploadProcess !== 100 && uploadProcess !== 0" status="success" />
    <div style="border: 1px solid #ccc; margin-top: 10px">
        <!-- 工具栏 -->
        <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" class="toolbar" />
        <!-- 文章 -->
        <div class="article">
            <!-- 标题 -->
            <div class="title">
                <input v-model="article.title" type="text" maxlength="20" placeholder="标题(不超过20个字)">
                <hr class="hr">
            </div>
            <!-- 内容 -->
            <Editor :defaultConfig="editorConfig" v-model="article.content" class="editor" @onCreated="handleCreated"
                @customPaste="customPaste" />
            <hr class="hr">
            <!-- 结尾 -->
            <div class="foot">
                <el-upload class="coverImg-uploader" action="/api/uploadImgToOSS" :show-file-list="false"
                    name="imageFile" :on-success="uploadCoverImgSuccess" :before-upload="beforeCoverImgUpload">
                    <img v-if="article.url" :src="article.url" class="avatar" />
                    <div v-else>
                        <span>+ 添加文章封面</span>
                    </div>
                </el-upload>

                <el-select v-model="article.provinceId" placeholder="省份" style="width: 120px">
                    <el-option v-for="item in province" :key="item.id" :label="item.provinceName" :value="item.id"
                        @click="chooseProvince()" />
                </el-select>

                <el-select v-model="article.scenicSpotId" placeholder="景点" style="width: 120px"
                    :disabled="!article.provinceId">
                    <el-option v-for="(item, index) in scenicSpot" :key="index" :label="item.sceneRollCall"
                        :value="item.id" />
                </el-select>
                <el-button type="success" @click="uploadArticle()">发布</el-button>
            </div>
        </div>
    </div>
</template>
<style scoped>
.toolbar{
    border-bottom: 1px solid #ccc;
}

.article {
    padding: 40px;
}

.title input {
    height: 50px;
    width: 98%;
    border: 0;
    outline: none;
    font-size: 30px;
    font-family: inherit;
    margin: 10px;
}

.title input::placeholder {
    opacity: 0.4;
}

.hr {
    border: none;
    height: 1px;
    background-color: rgb(229, 239, 232);
    width: 99%;
}

.editor {
    min-height: 400px;
    overflow-y: hidden
}

.foot {
    display: flex;
}

.coverImg-uploader div {
    width: 150px;
    height: 100px;
    border-radius: 5px;
    border: 1px dashed #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: small;
    color: #8c8484;
}

.coverImg-uploader img {
    width: 150px;
    height: 100px;
    border-radius: 5px;
}

.foot .el-button {
    margin-left: 400px;
    margin-top: 60px;
}

.el-select {
    width: 200px;
    margin-left: 40px;
    margin-top: 68px;
}
</style>