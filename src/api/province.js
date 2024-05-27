import request from '../utils/request.js'

//查询所有省份
export const getAllProvinceService=()=>{
    return request.get("/province/list");
}