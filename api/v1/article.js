var responseData = require('../../common/tools').responseData;  //统一返回数据封装
var validator = require('validator')   //验证
var ArticleProxy = require('../../proxy').Article  //方法
var TabProxy = require('../../proxy').Tab  //方法
var eventproxy = require('eventproxy') //异步协作
/**
 * 文章列表
 * @param req
 * @param res
 * @param next
 */
var articleList = function(req, res, next){
    var page = parseInt(req.params.page, 10) || 1;   //当前页数
    page = page > 0 ? page : 1;
    var limit = 2;
    var tab_id = req.params.tab_id || 'all'
    var keywords = req.query.keywords || ''

    var proxy = new eventproxy();
    proxy.fail(next);
    var query = {'deleted':false}
    var options = { skip: (page - 1) * limit, limit: limit, sort: [{'create_at': -1}]}
    if(tab_id !== 'all'){
        query.tab_id = tab_id
    }
    if(keywords){
        const reg = new RegExp(keywords, 'i')  //不区分大小写
        query.title = {$regex:reg}
    }
    ArticleProxy.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        proxy.emit('pages', pages);  //总页数
    }))

    ArticleProxy.getArticlesByQuery(query,options,proxy.done('articles', function (articles) {
        return articles;
    }))

    proxy.all('articles', 'pages',
        function (articles,  pages) {
            var data = {}
            data.articles = articles
            data.total_page = pages

            return res.json(responseData(200,'获取成功',data))
        });
}
exports.articleList = articleList

/**
 * 文章详情
 * @param req
 * @param res
 * @param next
 * @returns {*|void}
 */
exports.artDetails = function (req, res, next) {
    let article_id = req.params.id
    if(!article_id){
        return res.json(responseData(201,'缺少参数'))
    }
    var proxy = new eventproxy();
    proxy.fail(next);

    var query = {is_deleted:false}
    var options = {}
    TabProxy.getTabsByQuery(query,options,proxy.done('tabs', function (tabs) {
        return tabs;
    }))
    ArticleProxy.getArticleById(article_id,proxy.done('article', function (articles) {
        return articles;
    }))
    proxy.all('article', 'tabs',
        function (article,  tabs) {
            article.visit_count += 1
            article.save(function (err) {
                if (err) {
                    return res.json(responseData(201,'网络错误'))
                }
                var data = {}
                data.article = article
                for(var i = 0;i<tabs.length;i++){
                    if(tabs[i]._id.toString() == article.tab_id.toString()){
                        data.tab = tabs[i]
                    }
                }
                return res.json(responseData(200,'获取成功',data))
            });
        });
}
/**
 * 赞
 */
var fabulous = function (req, res, next) {
    let article_id = req.params.id
    let user_id = req.session.user._id
    if(!article_id){
        return res.json(responseData(201,'缺少必要参数'))
    }
    ArticleProxy.fabulousAddUser(user_id, article_id, function (err, article) {
        if (err) {
            return res.json(responseData(201,'网络错误'))
        }
        return res.json(responseData(200,'点赞成功'))
    })
}
exports.fabulous = fabulous
/**
 * 获取当前用户点赞过得文章
 * @param req
 * @param res
 * @param next
 */
exports.getFabulousArticles = function(req, res, next){
    var page = parseInt(req.params.page, 10) || 1;   //当前页数
    page = page > 0 ? page : 1;
    var limit = 2;
    var user_id = req.session.user._id

    var proxy = new eventproxy();
    proxy.fail(next);
    var query = {'deleted':false,fabulous_users: user_id}
    var options = { skip: (page - 1) * limit, limit: limit, sort: [{'create_at': -1}]}

    ArticleProxy.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        proxy.emit('pages', pages);  //总页数
    }))

    ArticleProxy.getArticlesByQuery(query,options,proxy.done('articles', function (articles) {
        return articles;
    }))

    proxy.all('articles', 'pages',
        function (articles,  pages) {
            var data = {}
            data.articles = articles
            data.total_page = pages

            return res.json(responseData(200,'获取成功',data))
        });

}

