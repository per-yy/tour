//提取字符串中的文字
export const extractTextFromHTML = (html) => {
    let text = html.replace(/<[^>]*>/g, '');
    //截取前num个字符
    let num = 100;
    if (text.length > num) {
        text = text.slice(0, num) + '...'

    }
    return text;
}

//提取文章列表中的文字
export const getText = (data) => {
    for (let i = 0; i < data.length; i++) {
        data[i].text = extractTextFromHTML(data[i].content);
    }
}