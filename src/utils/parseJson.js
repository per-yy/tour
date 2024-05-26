//解析响应结果的json
export const parseJson = (data) => {
    for (let i = 0; i < data.length; i++) {
        try {
            const jsonObject = JSON.parse(data[i].content);
            // console.log(jsonObject);
            data[i].content = jsonObject.content;
            // console.log(data[i].content);
        } catch (error) {
            console.error("无效的 JSON 字符串", error);
        }
    }
}
