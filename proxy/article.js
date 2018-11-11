var modles = require('../models')
var Article = modles.Article
var Tab = require('./tab')
var EventProxy = require('eventproxy');
var _          = require('lodash');  //辅助函数

/**
 * 新增文章
 * @param title
 * @param content
 * @param authorId
 * @param callback
 */
exports.newAndSave = function (title, content, authorId, tabId, main_img, callback) {
    var article = new Article()
    article.title = title
    article.content = content
    article.author_id = authorId
    article.tab_id = tabId
    article.main_img = main_img

    article.save(callback)
}
/**
 * 根据条件查询文章列表
 * @param query
 * @param opt
 * @param callback
 */
exports.getArticlesByQuery = function(query, opt, callback){
    Article.find(query, {}, opt, function (err, articles) {
        if (err) {
            return callback(err);
        }
        if (articles.length === 0) {
            return callback(null, []);
        }
        var proxy = new EventProxy();
        proxy.after('article_ready', articles.length, function () {
            articles = _.compact(articles); // 删除不合规的 topic
            return callback(null, articles);
        });
        proxy.fail(callback);
        articles.forEach(function (article, i) {
            var ep = new EventProxy();
            ep.all('tab', function (tab) {
                // 保证顺序
                // 分类可能已被删除
                if (tab) {
                    article.tab = tab;
                } else {
                    articles[i] = null;
                }
                proxy.emit('article_ready');
            });

            Tab.getTabById(article.tab_id, ep.done('tab'));
        });
    });
}
/**
 * 获取关键词能搜索到的数量
 * Callback:
 * - err, 数据库错误
 * - count, 主题数量
 * @param {String} query 搜索关键词
 * @param {Function} callback 回调函数
 */
exports.getCountByQuery = function (query, callback) {
    Article.count(query, callback);
};

/**
 * 根据ID
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} id 用户ID
 * @param {Function} callback 回调函数
 */
exports.getArticleById = function (id, callback) {
    if (!id) {
        return callback();
    }
    Article.findOne({_id: id}, callback);
};