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
