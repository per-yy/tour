//定制请求的实例

//导入axios  npm install axios
import axios from 'axios';
import { useTokenStore } from '../stores/token';

//定义一个变量,记录公共的前缀  ,  baseURL
// const baseURL = 'http://localhost:8080';
const baseURL = '/api';
const instance = axios.create({ baseURL })

//添加请求拦截器
instance.interceptors.request.use(
    (config) => {
        //请求前的回调
        //添加token
        const tokenStore = useTokenStore();
        if (tokenStore.token) {
            config.headers.jwt = tokenStore.token.jwt
        }
        return config;
    }
)

//添加响应拦截器
instance.interceptors.response.use(
    result => {
        return result.data;
    },
    err => {
        //异步的状态转化成失败的状态
        console.log("请求错误");
        return Promise.reject(err);
    }
)

export default instance;