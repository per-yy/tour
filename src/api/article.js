import request from '../utils/request.js'

//分页查询文章
export const getArticleService = (articlePageQueryDTO) => {
    return request.post("/article/page", articlePageQueryDTO);
}

//分页查询关注者的文章
export const getFollowedArticleService = (articlePageQueryDTO) => {
    return request.post("/article/follow/page", articlePageQueryDTO);
}

//根据id查询文章
export const getArticleByIdService=(id)=>{
    return request.get(`/article/detail/${id}`);
}

//查询我的文章
export const getMyArticleService=()=>{
    return request.get('/article/my');
}

//删除文章
export const deleteArticleService=(id)=>{
    return request.post(`/article/delete/${id}`);
}

//查询我收藏的文章
export const getMyCollectArticleService=()=>{
    return request.get('/article/myCollection')
}

//查询我喜欢的文章
export const getMyLikeArticleService=()=>{
    return request.get("/article/myLike");
}

//发布文章
export const uploadArticleService=(article)=>{
    return request.post("/article/add",article);
}