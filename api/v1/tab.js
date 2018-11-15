var Tab         = require('../../proxy').Tab;
var validator = require('validator')   //验证
var eventproxy = require('eventproxy') //异步协作
var tools = require('../../common/tools')
var responseData = require('../../common/tools').responseData;  //统一返回数据封装

//tab列表
exports.index= function(req, res, next){
    var page = parseInt(req.query.page, 10) || 1;   //当前页数
    page = page > 0 ? page : 1;
    var limit = 4;

    var proxy = new eventproxy();
    proxy.fail(next);

    var query = {'is_deleted':false}
    var options = { skip: (page - 1) * limit, limit: limit}


    Tab.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        proxy.emit('pages', pages);  //总页数
    }))

    Tab.getTabsByQuery(query,options,proxy.done('tabs', function (tabs) {
        return tabs;
    }))

    proxy.all('tabs', 'pages',
        function (tabs,  pages) {
            return res.json(responseData(200,'获取成功',tabs))
        });
}