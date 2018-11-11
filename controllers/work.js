var Work         = require('../proxy').Work;
var validator = require('validator')   //验证
var eventproxy = require('eventproxy') //异步协作
var tools = require('../common/tools')

//列表
exports.index= function(req, res, next){
    var page = parseInt(req.query.page, 10) || 1;   //当前页数
    page = page > 0 ? page : 1;
    var limit = 10;

    var proxy = new eventproxy();
    proxy.fail(next);

    var query = {'is_deleted':false}
    var options = { skip: (page - 1) * limit, limit: limit}


    Work.getCountByQuery(query, proxy.done(function (all_works_count) {
        var pages = Math.ceil(all_works_count / limit);
        proxy.emit('pages', pages);  //总页数
    }))

    Work.getWorksByQuery(query,options,proxy.done('works', function (works) {
        return works;
    }))

    proxy.all('works', 'pages',
        function (works,  pages) {
            res.render('admin/works', {
                works: works,
                current_page: page,
                pages: pages
            });
        });
}
//创建
exports.create = function (req, res, next) {
    var workname = validator.trim(req.body.workname);
    var workdesc     = validator.trim(req.body.workdesc || "");
    var order_num     = validator.trim(req.body.order_num);
    var type     = validator.trim(req.body.type);
    var main_img     = validator.trim(req.body.main_img);

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('prop_err', function (msg) {
        return tools.errorMessage('创建失败',res);
    });
    Work.newAndSave(workname, workdesc, order_num, type, main_img, function (err) {
        if (err) {
            return next(err);
        }
        return tools.successMessage('/admin/works','创建成功',res);
    });

};
//编辑-页面
exports.editPage = function (req, res, next) {
    let work_id = req.params.id
    if(!work_id){
        return res.send('缺少参数')
    }
    Work.getWorkById(work_id, function (err, work) {
        if (err) {
            return next(err);
        }
        if(!work){
            return next();
        }
        res.render('admin/work_edit',{work:work});
    })
}
//编辑-提交
exports.update = function (req, res, next) {
    var work_name = validator.trim(req.body.workname);
    var work_desc     = validator.trim(req.body.workdesc || "");
    var order_num     = validator.trim(req.body.order_num);
    var type     = validator.trim(req.body.type);
    var main_img     = validator.trim(req.body.main_img);
    var work_id     = validator.trim(req.body.work_id);

    Work.getWorkById(work_id, function (err, work) {
        if (err) {
            return next(err);
        }
        //
        work.work_name     = work_name;
        work.work_desc   = work_desc;
        work.order_num       = order_num;
        work.type       = type;
        work.main_img       = main_img;
        work.update_at = new Date();

        work.save(function (err) {
            if (err) {
                return next(err);
            }
            return tools.successMessage('/admin/works','编辑成功',res);
        });
    })
}
//软删除
exports.delete = function (req, res, next) {
    let work_id = req.params.id
    if(!work_id){
        return res.send('缺少参数')
    }
    Work.getWorkById(work_id, function (err, work) {
        if (err) {
            return next(err);
        }
        //
        work.is_deleted = true;

        work.save(function (err) {
            if (err) {
                return next(err);
            }
            return tools.successMessage('/admin/works','删除成功',res);
        });
    })
}
