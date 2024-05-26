import request from '@/utils/request'

//发送评论
export const sendCommentService=(commentData)=>{
    return request.post("/comment",commentData)
}