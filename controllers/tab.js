var Tab         = require('../proxy').Tab;
var validator = require('validator')   //验证
var eventproxy = require('eventproxy') //异步协作
var tools = require('../common/tools')

//tab列表
exports.index= function(req, res, next){
    var page = parseInt(req.query.page, 10) || 1;   //当前页数
    page = page > 0 ? page : 1;
    var limit = 10;

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
            res.render('admin/tabs', {
                tabs: tabs,
                current_page: page,
                pages: pages
            });
        });
}
//创建
exports.create = function (req, res, next) {
    var tabname = validator.trim(req.body.tabname);
    var tabdesc     = validator.trim(req.body.tabdesc || "");
    var order_num     = validator.trim(req.body.order_num);

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('prop_err', function (msg) {
        return tools.errorMessage('创建失败',res);
    });
    Tab.newAndSave(tabname, tabdesc, order_num, function (err) {
        if (err) {
            return next(err);
        }
        return tools.successMessage('/admin/tabs','创建成功',res);
    });

};
//编辑-页面
exports.editPage = function (req, res, next) {
    let tab_id = req.params.id
    if(!tab_id){
        return res.send('缺少参数')
    }
    Tab.getTabById(tab_id, function (err, tab) {
        if (err) {
            return next(err);
        }
        if(!tab){
            return next();
        }
        res.render('admin/tab_edit',{tab:tab});
    })
}
//编辑-提交
exports.update = function (req, res, next) {
    var tab_name = validator.trim(req.body.tabname);
    var tab_desc     = validator.trim(req.body.tabdesc || "");
    var order_num     = validator.trim(req.body.order_num);
    var tab_id     = validator.trim(req.body.tab_id);

    Tab.getTabById(tab_id, function (err, tab) {
        if (err) {
            return next(err);
        }
        //
        tab.tab_name     = tab_name;
        tab.tab_desc   = tab_desc;
        tab.order_num       = order_num;
        tab.update_at = new Date();

        tab.save(function (err) {
            if (err) {
                return next(err);
            }
            return tools.successMessage('/admin/tabs','编辑成功',res);
        });
    })
}
//软删除
exports.delete = function (req, res, next) {
    let tab_id = req.params.id
    if(!tab_id){
        return res.send('缺少参数')
    }
    Tab.getTabById(tab_id, function (err, tab) {
        if (err) {
            return next(err);
        }
        //
        tab.is_deleted = true;

        tab.save(function (err) {
            if (err) {
                return next(err);
            }
            return tools.successMessage('/admin/tabs','删除成功',res);
        });
    })
}
