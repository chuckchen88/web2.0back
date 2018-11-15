var models = require('../models')
var Tab = models.Tab

/**
 * 添加栏目
 * @param callback
 */
exports.newAndSave = function(tab_name,tab_desc,order_num,callback){
    var tab = new Tab()
    tab.tab_name = tab_name
    tab.tab_desc = tab_desc
    tab.order_num = order_num

    tab.save(callback)
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
exports.getTabsByQuery = function (query, opt, callback) {
    Tab.find(query, {}, opt, function (err, tabs) {
        if (err) {
            return callback(err);
        }
        if (tabs.length === 0) {
            return callback(null, []);
        }
        return callback(null, tabs);
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
    Tab.countDocuments(query, callback);
};

/**
 * 根据ID
 * Callback:
 * - err, 数据库异常
 * @param {Function} callback 回调函数
 */
exports.getTabById = function (id, callback) {
    if (!id) {
        return callback();
    }
    Tab.findOne({_id: id,is_deleted:false}, callback);
};