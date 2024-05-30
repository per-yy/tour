<script setup>
import router from '@/router';
import { useTokenStore } from '@/stores/token';
import { onBeforeMount, ref } from 'vue';
import { updateUserInfoService, updatePasswordService } from '@/api/user';
import { ElMessage } from 'element-plus';

//token
const tokenStore = useTokenStore();

const updateUserInfoDialogVisible = ref(false);

const updatePasswordDialogVisible = ref(false);

const imgType = ['image/jpeg', 'image/png', 'image/webp']

//用户信息 用于修改信息
const user = ref({
    username: '',
    url: '',
    email: ''
})

//用户密码 用户修改密码
const password = ref({
    oldPassword: '',
    newPassword: ''
})

//退出登录
const logout = () => {
    tokenStore.removeToken();
    tokenStore.removeUserInfo();
    router.push('/')
}
const init = () => {
    user.value.username = tokenStore.token.username;
    user.value.url = tokenStore.token.url;
    user.value.email = tokenStore.token.email;
}
//修改信息
const updateUserInfo = async () => {
    if (user.value.username.length > 8) {
        ElMessage.error("昵称过长")
        return;
    }
    let result = await updateUserInfoService(user.value);
    ElMessage.success('修改成功');
    //修改token
    tokenStore.setUserInfo(user.value);
    updateUserInfoDialogVisible.value = false;
}

const handleAvatarSuccess = (response, uploadFile) => {
    user.value.url = response;
}

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

const updatePassword = async () => {
    if (password.value.newPassword.length < 8) {
        ElMessage.error('密码不能少于8位')
    } else if (password.value.oldPassword === '') {
        ElMessage.error('原密码不为空')
    } else {
        let result = await updatePasswordService(password.value);
        if (result.code === 1) {
            updatePasswordDialogVisible.value = false;
            ElMessage.success('修改成功')
        } else {
            ElMessage.error(result.msg);
        }
    }
}

onBeforeMount(() => {
    init();
})
</script>
<template>
    <div class="content">
        <header>
            <div>
                <img :src="tokenStore.token.url" alt="">
                <span>{{ tokenStore.token.username }}</span>
            </div>
            <div class="button">
                <el-button @click="updateUserInfoDialogVisible = true">修改资料</el-button>
                <el-button @click="updatePasswordDialogVisible = true">修改密码</el-button>
                <el-button @click="logout()">退出登录</el-button>
            </div>
        </header>
        <main>
            <el-menu class="nav" mode="horizontal" default-active="1" active-text-color="#24BD51" router>
                <el-menu-item class="menu-item" index="/my/article">我的发布</el-menu-item>
                <el-menu-item class="menu-item" index="/my/follow">关注</el-menu-item>
                <el-menu-item class="menu-item" index="/my/collection">收藏</el-menu-item>
                <el-menu-item class="menu-item" index="/my/like">喜欢</el-menu-item>
            </el-menu>
            <router-view></router-view>
        </main>
        <!-- 修改用户信息对话框 -->
        <el-dialog v-model="updateUserInfoDialogVisible" title="修改信息" width="500" center align-center>
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
                    <el-input class="input" v-model="user.username" autocomplete="off"
                        @keydown.enter="updateUserInfo()" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div>
                    <el-button class="btn-login" type="success" @click="updateUserInfo()">
                        修改
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 修改密码对话框 -->
        <el-dialog v-model="updatePasswordDialogVisible" title="修改密码" width="500" center align-center>
            <el-form :model="user">
                <el-form-item label="原密码">
                    <el-input type="password" v-model="password.oldPassword" autocomplete="off" />
                </el-form-item>
                <el-form-item label="新密码">
                    <el-input type="password" v-model="password.newPassword" autocomplete="off" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div>
                    <el-button class="btn-login" type="success" @click="updatePassword()">
                        修改
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>

</template>
<style scoped>
.content {
    width: 900px;
    padding: 20px;
    margin: 0 auto;
    background-color: rgb(246, 255, 253);
    box-shadow: 0px 0 5px 0 rgba(0, 0, 0, 0.2);
}

header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

header div {
    width: fit-content;
    display: flex;
    align-items: center;
}

header div img {
    height: 100px;
    width: 100px;
    border-radius: 5px;
}

header div span {
    margin-left: 20px;
    font-size: 30px;
    font-weight: 800
}

main {
    margin-top: 100px
}

.avatar-uploader .avatar {
    width: 150px;
    height: 150px;
}

.btn-login {
    width: 467px;
    height: 40px;
}
</style>