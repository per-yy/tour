import request from '../utils/request.js'

//查询所有文章
export const getArticleService = (ArticlePageQueryDTO) => {
    return request.get("/article/page",ArticlePageQueryDTO);
}