var Article         = require('../proxy').Article;
var Tab         = require('../proxy').Tab;
var validator = require('validator')   //验证
var eventproxy = require('eventproxy') //异步协作
var tools = require('../common/tools')

//列表
exports.index = function(req, res, next){
    var page = parseInt(req.query.page, 10) || 1;   //当前页数
    page = page > 0 ? page : 1;
    var limit = 10;

    var proxy = new eventproxy();
    proxy.fail(next);

    var query = {'deleted':false}
    var options = { skip: (page - 1) * limit, limit: limit, sort: [{'create_at': -1}]}


    Article.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        proxy.emit('pages', pages);  //总页数
    }))

    Article.getArticlesByQuery(query,options,proxy.done('articles', function (articles) {
        return articles;
    }))

    proxy.all('articles', 'pages',
        function (articles,  pages) {
            res.render('admin/articles', {
                articles: articles,
                current_page: page,
                pages: pages
            });
        });
}

//创建--页面
exports.createPage = function (req, res, next) {
    var query = {is_deleted:false}
    var options = {}
    Tab.getTabsByQuery(query,options,function (err,tabs) {
        if (err) {
            return next(err);
        }
        res.render('admin/articles_add',{tabs: tabs});
    })
};
//创建--提交
exports.create = function (req, res, next) {
    var title = req.body.title
    var content = req.body.article_desc
    var main_img = req.body.main_img
    var tab_id = req.body.tab

    Article.newAndSave(title,content,req.session.user._id,tab_id,main_img,function(err,article){
        if (err) {
            return next(err);
        }
        return tools.successMessage('/admin/articles','创建成功',res);
    })
}

//编辑--页面
exports.editPage = function (req, res, next) {
    let article_id = req.params.id
    if(!article_id){
        return res.send('缺少参数')
    }
    var proxy = new eventproxy();
    proxy.fail(next);

    var query = {is_deleted:false}
    var options = {}
    Tab.getTabsByQuery(query,options,proxy.done('tabs', function (tabs) {
        return tabs;
    }))
    Article.getArticleById(article_id,proxy.done('article', function (articles) {
        return articles;
    }))
    proxy.all('article', 'tabs',
        function (article,  tabs) {
            res.render('admin/articles_edit', {
                article: article,
                tabs:tabs
            });
        });
}
//编辑-提交
exports.update = function (req, res, next) {
    var title = req.body.title
    var content = req.body.article_desc
    var main_img = req.body.main_img
    var tab_id = req.body.tab
    var article_id = req.body.article_id

    Article.getArticleById(article_id,function (err, article) {
        if (err) {
            return next(err);
        }
        //
        article.title     = title;
        article.content   = content;
        article.main_img       = main_img;
        article.tab_id       = tab_id;
        article.update_at = new Date();

        article.save(function (err) {
            if (err) {
                return next(err);
            }
            return tools.successMessage('/admin/articles','编辑成功',res);
        });
    })
}
//软删除
exports.delete = function (req, res, next) {
    let article_id = req.params.id
    if(!article_id){
        return res.send('缺少参数')
    }
    Article.getArticleById(article_id, function (err, article) {
        if (err) {
            return next(err);
        }
        //
        article.deleted = true;

        article.save(function (err) {
            if (err) {
                return next(err);
            }
            return tools.successMessage('/admin/articles','删除成功',res);
        });
    })
}