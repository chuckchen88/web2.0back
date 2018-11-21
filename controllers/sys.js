var Sys         = require('../proxy').Sys;
var validator = require('validator')   //验证
var eventproxy = require('eventproxy') //异步协作
var tools = require('../common/tools')

//列表
exports.list = function(req, res, next){
    var page = parseInt(req.query.page, 10) || 1;   //当前页数
    page = page > 0 ? page : 1;
    var limit = 10;

    var proxy = new eventproxy();
    proxy.fail(next);

    var query = {'deleted':false}
    var options = { skip: (page - 1) * limit, limit: limit, sort: [{'create_at': -1}]}


    Sys.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        proxy.emit('pages', pages);  //总页数
    }))

    Sys.getSysByQuery(query,options,proxy.done('sys', function (sys) {
        return sys;
    }))

    proxy.all('sys', 'pages',
        function (sys,  pages) {
            res.render('admin/sys', {
                sys: sys,
                current_page: page,
                pages: pages
            });
        });
}
//创建
exports.create = function (req, res, next) {
    var title = validator.trim(req.body.title);
    var content     = validator.trim(req.body.content);

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('prop_err', function (msg) {
        return tools.errorMessage('创建失败',res);
    });
    Sys.newAndSave(title, content, function (err) {
        if (err) {
            return next(err);
        }
        return tools.successMessage('/admin/tabs','创建成功',res);
    });
};

//软删除
exports.delete = function (req, res, next) {
    let sys_id = req.params.id
    if(!sys_id){
        return res.send('缺少参数')
    }
    Sys.getMessageBySysId(sys_id, function (err, sys) {
        if (err) {
            return next(err);
        }
        //
        sys.deleted = true;

        sys.save(function (err) {
            if (err) {
                return next(err);
            }
            return tools.successMessage('/admin/sysmsg','删除成功',res);
        });
    })
}