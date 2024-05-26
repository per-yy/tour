import request from '../utils/request.js'

//收藏
export const collectService = (id) => {
    return request.post(`/collectArticle/${id}`);
}

//取消收藏
export const cancelCollectService = (id) => {
    return request.post(`/abolishCollectArticle/${id}`);
}