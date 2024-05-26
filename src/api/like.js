import request from '../utils/request.js'

//喜欢文章
export const likeService = (id) => {
    return request.post(`/article/ThumbsUp/${id}`);
}

//取消喜欢文章
export const cancelLikeService = (id) => {
    return request.post(`/article/disThumbsUp/${id}`);
}

//喜欢景点
export const likeScenicSpotService = (id) => {
    return request.post(`/scenicSpot/like/${id}`);
}

//取消喜欢景点
export const cancelLikeScenicSpotService = (id) => {
    return request.post(`/scenicSpot/abolishLike/${id}`);
}