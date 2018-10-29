var modles = require('../models')
var Article = modles.Article

/**
 * 新增文章
 * @param title
 * @param content
 * @param authorId
 * @param callback
 */
exports.newAndSave = function (title, content, authorId, callback) {
    var article = new Article()
    article.title = title
    article.content = content
    article.author_id = authorId

    article.save(callback)
}
/**
 * 根据条件查询文章列表
 * @param query
 * @param opt
 * @param callback
 */
exports.getArticlesByQuery = function(query, opt, callback){

}