/**
 * tabname  分类名称
 */
var mongoose = require('mongoose')
var BaseModel = require('./base_model')
var Schema = mongoose.Schema

//定义schema
var TabSchema = new Schema({
    tab_name: { type: String},
    tab_desc: { type: String},
    order_num: { type: Number},
    is_deleted: { type: Boolean, default: false },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
})
TabSchema.plugin(BaseModel)
mongoose.model('Tab', TabSchema)