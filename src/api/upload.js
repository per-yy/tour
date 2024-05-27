import request from '../utils/request.js'

export const uploadImgService = (file) => {
    const formData = new FormData();
    formData.append('imageFile', file); // 'imageFile' 应该与后端接收的参数名一致
    return request.post('/uploadImgToOSS', formData, {
        headers: {
            'Content-Type': 'multipart/form-data' // 告诉服务器你正在发送 multipart/form-data
        }
    });
}