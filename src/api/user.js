import request from '../utils/request.js'

//获取用户信息
export const getUserInfoService=()=>{
    return request.get('/user/userInfo')
}

//登录
export const loginService=(userLoginDTO)=>{
    return request.post('/login',userLoginDTO)
}

//注册
export const regService=(userRegDTO)=>{
    return request.post('/reg',userRegDTO)
}

//发送邮箱验证码
export const sendService = (email) => {
    return request.post("/send", {
        email: email
    })
}

//查询关注的用户
export const getFollowedUsers=()=>{
    return request.get("/followee/list");
}

//关注用户
export const followUserService=(id)=>{
    return request.post(`/follow/${id}`);
}

//取消关注用户
export const unFollowUserService=(id)=>{
    return request.post(`/unfollow/${id}`);
}

//查询关注的用户
export const getFollowedUserService=()=>{
    return request.get('/followee/list');
}

//修改用户信息 包括用户名和头像
export const updateUserInfoService=(user)=>{
    return request.post('/user/updateInfo',user);
}

//修改密码
export const updatePasswordService=(password)=>{
    return request.post('/user/updatePassword',password);
}