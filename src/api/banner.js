import request from '../utils/request.js'

export const getBannerService=()=>{
    return request.get('/banner/select')
}