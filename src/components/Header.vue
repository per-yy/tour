<script setup>
import { onMounted, ref } from 'vue';
import { getUserInfoService, loginService, regService, sendService } from '../api/user.js'
import { useTokenStore } from '@/stores/token.js';
import { isValidEmail } from '@/utils/isValidEmail.js';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue'
import router from '@/router/index.js';
//登陆表单控制
const loginDialogVisible = ref(false)

//注册表单控制
const regDialogVisible = ref(false)

//控制发送按钮的禁用
const countDown = ref(300);

//用户信息
const tokenStore = useTokenStore();

//标记登陆状态
const isLogin = ref(false)

//返回的验证码及时间
const verificationCode = ref({
    code: '',
    dataTime: ''
})

//用户
const user = ref({
    username: '',
    email: '',
    password: '',
    url: '',
    code: ''
})

//获取用户信息
const getUserInfo = async () => {
    let result = await getUserInfoService();
    if (result.code === 1) {
        isLogin.value = true;
        tokenStore.setUserInfo(result.data);
    } else {
        ElMessage.error(result.msg);
        //未登录或登录过期 清除token
        tokenStore.removeToken();
        tokenStore.removeUserInfo();
    }
}

//登录
const login = async () => {
    if (user.value.email === '' || user.value.password === '') {
        ElMessage.error('请输入完整信息');
        return;
    }
    let result = await loginService(user.value);
    if (result.code === 1) {
        //登陆成功 设置jwt和用户信息
        tokenStore.setToken(result.data.jwt);
        tokenStore.setUserInfo(result.data.user);
        loginDialogVisible.value = false;
        ElMessage.success('登录成功')
        isLogin.value = true;
    } else {
        ElMessage.error(result.msg);
    }
}

//注册
const reg = async () => {
    if (user.value.username === '' || user.value.email === '' || user.value.password === '' || user.value.url === '') {
        ElMessage.error("请填写完整信息")
    } else if (user.value.password.length < 8) {
        ElMessage.error("密码不能少于8位")
    } else if (verificationCode.value.code === '') {
        ElMessage.error("请填写验证码")
    } else if (verificationCode.value.code !== user.value.code) {
        ElMessage.error("验证码错误")
    } else if (new Date() - Date.parse(verificationCode.dateTime) > 300 * 1000) {
        ElMessage.error("验证码已过期")
    } else {
        let result = await regService(user.value);
        if (result.code === 1) {
            ElMessage.success("注册成功")
            regDialogVisible.value = false;
        } else {
            ElMessage.error(result.msg);
        }
    }
}

//发送验证码
const send = async () => {
    if (!isValidEmail(user.value.email)) {
        ElMessage.error("请输入正确的邮箱")
    } else {
        let result = await sendService(user.value.email);
        if (result.code === 1) {
            disableButton();//禁用按钮
            ElMessage.success('发送成功')
            verificationCode.value = result.data;
        } else {
            ElMessage.error(result.msg)
        }
    }
}

//定时控制按钮的禁用
const disableButton = () => {
    const timer = setInterval(() => {
        countDown.value -= 1;
        if (countDown.value === 0) {
            clearInterval(timer);
            countDown.value = 300; // 重置倒计时
        }
    }, 1000);
}

const handleAvatarSuccess = (response, uploadFile) => {
    // user.value.url = URL.createObjectURL(uploadFile.raw)
    user.value.url = response;
}

const imgType=['image/jpeg','image/png','image/webp']
const beforeAvatarUpload = (rawFile) => {
    if (!imgType.includes(rawFile.type)) {
        ElMessage.error('图片格式错误')
        return false
    } else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error('图片不能大于2MB')
        return false
    }
    return true;
}

onMounted(async () => {
    await getUserInfo();
})

const goToMyPage = () => {
    router.push('/my')
}

const goToWriteArticle = () => {
    router.push('/writeArticle')
}

//退出登录
const logout = () => {
    tokenStore.removeToken();
    tokenStore.removeUserInfo();
    router.push('/')
}
</script>

<template>
    <header>
        <div class="logo"><img src="../../public/logo/logo-tuji.png" alt=""></div>
        <el-menu class="nav" mode="horizontal" router default-active="/" active-text-color="#24BD51">
            <el-menu-item class="menu-item" index="/">首页</el-menu-item>
            <el-menu-item class="menu-item" index="/scenicSpot">景点</el-menu-item>
            <el-menu-item class="menu-item" index="/follow">关注</el-menu-item>
        </el-menu>
        <!-- 登录情况 -->
        <div class="button" v-if="tokenStore.token.jwt === ''">
            <el-button class="btn" type="success" @click="loginDialogVisible = true">登录</el-button>
            <el-button class="btn" type="info" plain @click="regDialogVisible = true">注册</el-button>
        </div>
        <el-dropdown v-else trigger="click">
            <div class="head-sculpture">
                <img :src="tokenStore.token.url" alt="">
            </div>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="goToMyPage()">个人中心</el-dropdown-item>
                    <el-dropdown-item divided @click="goToWriteArticle()">发布文章</el-dropdown-item>
                    <el-dropdown-item divided @click="logout()">退出登录</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>

        <!-- 登录对话框 -->
        <el-dialog v-model="loginDialogVisible" title="登录" width="500" center align-center>
            <el-form :model="user">
                <el-form-item>
                    <el-input class="input" v-model="user.email" autocomplete="off" placeholder="邮箱"
                        style="width: 467px;" />
                </el-form-item>
                <el-form-item>
                    <el-input class="input" type="password" v-model="user.password" autocomplete="off" placeholder="密码"
                        style="width: 467px;" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div>
                    <el-button class="btn-login" type="success" @click="login()">
                        登录
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 注册对话框 -->
        <el-dialog v-model="regDialogVisible" title="注册" width="500" center align-center>

            <div style="display: flex;margin-bottom: 20px;">
                <span style="margin-right: 20px;font-size: medium;;">头像</span>
                <el-upload class="avatar-uploader" action="/api/uploadImgToOSS" :show-file-list="false" name="imageFile"
                    :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                    <img v-if="user.url" :src="user.url" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon">
                        <Plus />
                    </el-icon>
                </el-upload>
            </div>

            <el-form :model="user">
                <el-form-item label="用户名">
                    <el-input class="input" v-model="user.username" autocomplete="off" />
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input class="input" v-model="user.email" style="margin-left: 15px;" autocomplete="off" />
                </el-form-item>
                <el-form-item label="密码">
                    <el-input class="input" v-model="user.password" style="margin-left: 15px;" autocomplete="off" />
                </el-form-item>
                <el-form-item label="验证码">
                    <el-input class="input" v-model="user.code" autocomplete="off" style="width: 300px;" />
                    <el-button type="success" @click="send()" :disabled="countDown !== 300"
                        style="height: 40px;width: 104px; margin-left: 10px; ">
                        {{ countDown < 300 ? `${countDown}S` : '发送验证码' }} </el-button>
                </el-form-item>

            </el-form>
            <template #footer>
                <div>
                    <el-button class="btn-login" type="success" @click="reg()">
                        注册
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </header>
</template>

<style scoped>
header {
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.2);
    background-color: white;
}

.logo img {
    height: 50px;
    margin: 0;
}

.nav {
    width: 320px;
    margin-left: 5%;
    border-bottom: none;
    font-weight: bold;
    font-size: xx-small;
}

.menu-item {
    font-size: 20px;
}

.menu-item:hover {
    color: #24BD51 !important;
}

.btn {
    font-size: medium;
    height: 40px;
    width: 80px;
}

.head-sculpture img {
    width: 45px;
    height: 45px;
    border-radius: 5px;
}

.input {
    height: 40px;
    width: 415px;
}

.btn-login {
    width: 467px;
    height: 40px;
}

.avatar-uploader .avatar {
    width: 150px;
    height: 150px;
}
</style>

<!-- 上传头像的样式 -->
<style>
.avatar-uploader .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 150px;
    height: 150px;
    text-align: center;
}
</style>
