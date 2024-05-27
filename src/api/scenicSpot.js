import request from '../utils/request.js'

//查询所有景点
export const getScenicSpotService = (scenicSpotPageQueryDTO) => {
    return request.post("/scenicSpot/page", scenicSpotPageQueryDTO);
}

export const getScenicSpotByIdService=(id)=>{
    return request.get(`/scenicSpot/detail/${id}`);
}

//根据省份id查询景点
export const getAllScenicSpotService=(id)=>{
    return request.get(`/scenicSpot/list/${id}`);
}