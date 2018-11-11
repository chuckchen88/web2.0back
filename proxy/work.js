var models = require('../models')
var Work = models.Work

/**
 * 添加栏目
 * @param name
 * @param loginname
 * @param pass
 * @param email
 * @param avatar_url
 * @param callback
 */
exports.newAndSave = function(work_name,work_desc,order_num,type,main_img,callback){
    var work = new Work()
    work.work_name = work_name
    work.work_desc = work_desc
    work.order_num = order_num
    work.type = type
    work.main_img = main_img

    work.save(callback)
}

/**
 * 根据关键词，获取栏目列表
 * Callback:
 * - err, 数据库错误
 * - count, 主题列表
 * @param {String} query 搜索关键词
 * @param {Object} opt 搜索选项
 * @param {Function} callback 回调函数
 */
exports.getWorksByQuery = function (query, opt, callback) {
    Work.find(query, {}, opt, function (err, works) {
        if (err) {
            return callback(err);
        }
        if (works.length === 0) {
            return callback(null, []);
        }
        return callback(null, works);
    });
};

/**
 * 获取关键词能搜索到的栏目数量
 * Callback:
 * - err, 数据库错误
 * - count, 主题数量
 * @param {String} query 搜索关键词
 * @param {Function} callback 回调函数
 */
exports.getCountByQuery = function (query, callback) {
    Work.count(query, callback);
};

/**
 * 根据ID
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} id 用户ID
 * @param {Function} callback 回调函数
 */
exports.getWorkById = function (id, callback) {
    if (!id) {
        return callback();
    }
    Work.findOne({_id: id,is_deleted:false}, callback);
};