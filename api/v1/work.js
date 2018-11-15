var responseData = require('../../common/tools').responseData;  //统一返回数据封装
var validator = require('validator')   //验证
var WorkProxy = require('../../proxy').Work;
var eventproxy = require('eventproxy') //异步协作
var _ = require('lodash')

//列表
exports.index= function(req, res, next){
    var page = parseInt(req.query.page, 10) || 1;   //当前页数
    page = page > 0 ? page : 1;
    var limit = 20;

    var proxy = new eventproxy();
    proxy.fail(next);

    var query = {'is_deleted':false}
    var options = { skip: (page - 1) * limit, limit: limit,sort:'-order_num'}


    WorkProxy.getCountByQuery(query, proxy.done(function (all_works_count) {
        var pages = Math.ceil(all_works_count / limit);
        proxy.emit('pages', pages);  //总页数
    }))

    WorkProxy.getWorksByQuery(query,options,proxy.done('works', function (works) {
        return works;
    }))

    proxy.all('works', 'pages',
        function (works,  pages) {
            return res.json(responseData(200,'获取成功',works))
        });
}