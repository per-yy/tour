import { defineStore } from 'pinia'
import { ref } from 'vue'
/**
 * 第一个参数: 名字，唯一性
 * 第二个参数: 函数，函数内部定义状态的所有内容
 * 返回值: 函数
 * 
 */
export const useTokenStore = defineStore('token', () => {
    //定义状态的内容

    //响应式变量
    const token = ref({
        jwt: '',
        username: '',
        email: '',
        url: ''
    })

    //定义一个函数，用来修改token
    const setToken = (newToken) => {
        token.value.jwt = newToken
    }
    const setUserInfo = (newUserInfo) => {
        token.value.username = newUserInfo.username;
        token.value.email = newUserInfo.email;
        token.value.url = newUserInfo.url;
    }

    //移除token的函数同时清空用户信息
    const removeToken = () => {
        token.value.jwt = '';
    }
    const removeUserInfo = () => {
        token.value.username = '';
        token.value.email = '';
        token.value.url = '';
    }

    return {
        token, setToken, removeToken,setUserInfo,removeUserInfo
    }
}, {
    //持久化存储
    persist: true
})